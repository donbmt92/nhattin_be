import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';

export class InventoryModel extends BaseModel {
  id_warehouse: Types.ObjectId;
  id_product: Types.ObjectId;
  quantity: number;

  constructor(inventory: any) {
    super(inventory);
    this.id_warehouse = inventory.id_warehouse;
    this.id_product = inventory.id_product;
    this.quantity = inventory.quantity;
  }

  static fromEntity(entity: any): InventoryModel {
    return new InventoryModel({
      id: entity._id,
      id_warehouse: entity.id_warehouse,
      id_product: entity.id_product,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): InventoryModel[] {
    return entities.map((entity) => InventoryModel.fromEntity(entity));
  }
} 