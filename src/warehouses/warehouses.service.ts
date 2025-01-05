import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseModel } from './model/warehouse.model';
import { MessengeCode } from '../common/exception/MessengeCode';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<WarehouseModel> {
    const existingWarehouse = await this.warehouseModel.findOne({
      name: createWarehouseDto.name,
    });

    if (existingWarehouse) {
      throw MessengeCode.WAREHOUSE.ALREADY_EXISTS;
    }

    const createdWarehouse = new this.warehouseModel(createWarehouseDto);
    const savedWarehouse = await createdWarehouse.save();
    return WarehouseModel.fromEntity(savedWarehouse);
  }

  async findAll(): Promise<WarehouseModel[]> {
    const warehouses = await this.warehouseModel.find().exec();
    return WarehouseModel.fromEntities(warehouses);
  }

  async findOne(id: string): Promise<WarehouseModel> {
    const warehouse = await this.warehouseModel
      .findById(new Types.ObjectId(id))
      .exec();

    if (!warehouse) {
      throw MessengeCode.WAREHOUSE.NOT_FOUND;
    }

    return WarehouseModel.fromEntity(warehouse);
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<WarehouseModel> {
    if (updateWarehouseDto.name) {
      const existingWarehouse = await this.warehouseModel.findOne({
        _id: { $ne: new Types.ObjectId(id) },
        name: updateWarehouseDto.name,
      });

      if (existingWarehouse) {
        throw MessengeCode.WAREHOUSE.ALREADY_EXISTS;
      }
    }

    const updatedWarehouse = await this.warehouseModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateWarehouseDto, { new: true })
      .exec();

    if (!updatedWarehouse) {
      throw MessengeCode.WAREHOUSE.NOT_FOUND;
    }

    return WarehouseModel.fromEntity(updatedWarehouse);
  }

  async remove(id: string): Promise<WarehouseModel> {
    const deletedWarehouse = await this.warehouseModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedWarehouse) {
      throw MessengeCode.WAREHOUSE.NOT_FOUND;
    }

    return WarehouseModel.fromEntity(deletedWarehouse);
  }
} 