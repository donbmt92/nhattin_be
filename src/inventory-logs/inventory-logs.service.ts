import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryLog, InventoryLogDocument } from './schemas/inventory-log.schema';
import { CreateInventoryLogDto } from './dto/create-inventory-log.dto';
import { InventoryLogModel } from './model/inventory-log.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class InventoryLogsService {
  constructor(
    @InjectModel(InventoryLog.name) private inventoryLogModel: Model<InventoryLogDocument>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(createInventoryLogDto: CreateInventoryLogDto): Promise<InventoryLogModel> {
    // Kiểm tra inventory tồn tại
    await this.inventoryService.findOne(createInventoryLogDto.id_inventory);

    const createdLog = new this.inventoryLogModel({
      ...createInventoryLogDto,
      id_inventory: new Types.ObjectId(createInventoryLogDto.id_inventory),
      transaction_date: new Date()
    });

    const savedLog = await createdLog.save();
    return InventoryLogModel.fromEntity(savedLog);
  }

  async findByInventoryId(inventoryId: string): Promise<InventoryLogModel[]> {
    const logs = await this.inventoryLogModel
      .find({ id_inventory: new Types.ObjectId(inventoryId) })
      .sort({ transaction_date: -1 })
      .populate('id_inventory')
      .exec();

    return InventoryLogModel.fromEntities(logs);
  }

  async findAll(): Promise<InventoryLogModel[]> {
    const logs = await this.inventoryLogModel
      .find()
      .sort({ transaction_date: -1 })
      .populate('id_inventory')
      .exec();

    return InventoryLogModel.fromEntities(logs);
  }

  async findOne(id: string): Promise<InventoryLogModel> {
    const log = await this.inventoryLogModel
      .findById(new Types.ObjectId(id))
      .populate('id_inventory')
      .exec();

    if (!log) {
      throw MessengeCode.INVENTORY_LOG.NOT_FOUND;
    }

    return InventoryLogModel.fromEntity(log);
  }
} 