import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
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
        { new: true }
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
    const inventories = await this.inventoryModel
      .find({ id_product: new Types.ObjectId(productId) })
      .exec();

    const totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    return totalStock >= quantity;
  }
} 