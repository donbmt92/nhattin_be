/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { InventoryLog, InventoryLogDocument } from './schemas/inventory-log.schema';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { MessengeCode } from '../common/exception/MessengeCode';
import { WarehousesService } from '../warehouses/warehouses.service';
import { ProductsService } from '../products/products.service';
import { InventoryModel } from './model/inventory.model';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(InventoryLog.name) private inventoryLogModel: Model<InventoryLogDocument>,
    private readonly warehousesService: WarehousesService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<InventoryModel> {
    // Kiểm tra warehouse và product tồn tại
    await this.warehousesService.findOne(createInventoryDto.id_warehouse);
    await this.productsService.findById(createInventoryDto.id_product);

    const existingInventory = await this.inventoryModel.findOne({
      id_warehouse: new Types.ObjectId(createInventoryDto.id_warehouse),
      id_product: new Types.ObjectId(createInventoryDto.id_product),
    });

    if (existingInventory) {
      throw MessengeCode.INVENTORY.ALREADY_EXISTS;
    }

    const createdInventory = new this.inventoryModel({
      id_warehouse: new Types.ObjectId(createInventoryDto.id_warehouse),
      id_product: new Types.ObjectId(createInventoryDto.id_product),
      quantity: createInventoryDto.quantity,
    });

    const savedInventory = await createdInventory.save();
    return InventoryModel.fromEntity(savedInventory);
  }

  async findAll(): Promise<InventoryModel[]> {
    const inventories = await this.inventoryModel
      .find()
      .populate('id_warehouse')
      .populate('id_product')
      .exec();
    return InventoryModel.fromEntities(inventories);
  }

  async findByWarehouse(warehouseId: string): Promise<InventoryModel[]> {
    const inventories = await this.inventoryModel
      .find({ id_warehouse: new Types.ObjectId(warehouseId) })
      .populate('id_product')
      .exec();
    return InventoryModel.fromEntities(inventories);
  }

  async findOne(id: string): Promise<InventoryModel> {
    const inventory = await this.inventoryModel
      .findById(new Types.ObjectId(id))
      .populate('id_warehouse')
      .populate('id_product')
      .exec();

    if (!inventory) {
      throw MessengeCode.INVENTORY.NOT_FOUND;
    }

    return InventoryModel.fromEntity(inventory);
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<InventoryModel> {
    const updatedInventory = await this.inventoryModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { quantity: updateInventoryDto.quantity },
        { new: true },
      )
      .exec();

    if (!updatedInventory) {
      throw MessengeCode.INVENTORY.NOT_FOUND;
    }

    return InventoryModel.fromEntity(updatedInventory);
  }

  async remove(id: string): Promise<InventoryModel> {
    const deletedInventory = await this.inventoryModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedInventory) {
      throw MessengeCode.INVENTORY.NOT_FOUND;
    }

    return InventoryModel.fromEntity(deletedInventory);
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    console.log('productId', productId);
    console.log('quantity', quantity);
    
    const inventories = await this.inventoryModel
      .find({ id_product: new Types.ObjectId(productId) })
      .exec();
    console.log('inventories', inventories);
    
    if (!inventories || inventories.length === 0) {
      console.log('No inventory found for product:', productId);
      return false;
    }
    
    const totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0); 
    console.log('totalStock:', totalStock, 'required:', quantity); 
    return totalStock >= quantity;
  }

  async checkAndReduceInventory(productId: Types.ObjectId, quantity: number): Promise<void> {
    // Tìm tất cả inventory của sản phẩm
    const inventories = await this.inventoryModel
      .find({ id_product: productId })
      .sort({ quantity: -1 }) // Sắp xếp theo số lượng giảm dần
      .exec();
    
    if (!inventories || inventories.length === 0) {
      throw new BadRequestException('Không tìm thấy thông tin tồn kho của sản phẩm');
    }

    // Tính tổng tồn kho
    const totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    if (totalStock < quantity) {
      throw new BadRequestException(`Số lượng sản phẩm trong kho không đủ. Có ${totalStock} sản phẩm, cần ${quantity}`);
    }

    // Giảm tồn kho từ các kho có số lượng nhiều nhất
    let remainingQuantity = quantity;
    
    for (const inventory of inventories) {
      if (remainingQuantity <= 0) break;
      
      const reduceAmount = Math.min(remainingQuantity, inventory.quantity);
      
      // Giảm tồn kho
      inventory.quantity -= reduceAmount;
      await inventory.save();

      // Tạo log
      const log = new this.inventoryLogModel({
        id_inventory: inventory._id,
        quantity: -reduceAmount,
        transaction_type: 'order',
        note: `Giảm tồn kho do đặt hàng (${reduceAmount} sản phẩm)`,
        transaction_date: new Date()
      });

      await log.save();
      
      remainingQuantity -= reduceAmount;
    }
  }

  // Method để tạo inventory mặc định cho sản phẩm mới
  async createDefaultInventory(productId: string, warehouseId: string, quantity: number = 100): Promise<InventoryModel> {
    try {
      // Kiểm tra xem đã có inventory chưa
      const existingInventory = await this.inventoryModel.findOne({
        id_product: new Types.ObjectId(productId),
        id_warehouse: new Types.ObjectId(warehouseId)
      });

      if (existingInventory) {
        return InventoryModel.fromEntity(existingInventory);
      }

      // Tạo inventory mới
      const createInventoryDto = {
        id_product: productId,
        id_warehouse: warehouseId,
        quantity: quantity
      };

      return await this.create(createInventoryDto);
    } catch (error) {
      console.error('Error creating default inventory:', error);
      throw new BadRequestException('Không thể tạo tồn kho mặc định cho sản phẩm');
    }
  }
}
