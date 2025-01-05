import { BaseModel } from '../../common/model/base.model';

export class WarehouseModel extends BaseModel {
  name: string;
  location: string;

  constructor(warehouse: any) {
    super(warehouse);
    this.name = warehouse.name;
    this.location = warehouse.location;
  }

  static fromEntity(entity: any): WarehouseModel {
    return new WarehouseModel({
      id: entity._id,
      name: entity.name,
      location: entity.location,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): WarehouseModel[] {
    return entities.map(entity => WarehouseModel.fromEntity(entity));
  }
}
