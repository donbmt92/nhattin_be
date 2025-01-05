import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';

export class InventoryLogModel extends BaseModel {
  id_inventory: Types.ObjectId;
  quantity: number;
  note: string;
  transaction_type: string;
  transaction_date: Date;

  constructor(log: any) {
    super(log);
    this.id_inventory = log.id_inventory;
    this.quantity = log.quantity;
    this.note = log.note;
    this.transaction_type = log.transaction_type;
    this.transaction_date = log.transaction_date;
  }

  static fromEntity(entity: any): InventoryLogModel {
    return new InventoryLogModel({
      id: entity._id,
      id_inventory: entity.id_inventory,
      quantity: entity.quantity,
      note: entity.note,
      transaction_type: entity.transaction_type,
      transaction_date: entity.transaction_date,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): InventoryLogModel[] {
    return entities.map(entity => InventoryLogModel.fromEntity(entity));
  }
} 