import { BaseModel } from '../../common/model/base.model';

export class CategoryModel extends BaseModel {
  type: string;
  name: string;
  constructor(category: any) {
    super(category);
    this.type = category.type;
    this.name = category.name;
  }

  static fromEntity(entity: any): CategoryModel {
    return new CategoryModel({
      id: entity._id,
      type: entity.type,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): CategoryModel[] {
    return entities.map((entity) => CategoryModel.fromEntity(entity));
  }
}