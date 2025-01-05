import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';

export class ProductModel extends BaseModel {
  id_category: Types.ObjectId;
  id_discount?: Types.ObjectId;
  id_inventory?: Types.ObjectId;
  name: string;
  image: string;
  desc: string;
  price: number;

  constructor(product: any) {
    super(product);
    this.id_category = product.id_category;
    this.id_discount = product.id_discount;
    this.id_inventory = product.id_inventory;
    this.name = product.name;
    this.image = product.image;
    this.desc = product.desc;
    this.price = product.price;
  }

  static fromEntity(entity: any): ProductModel {
    return new ProductModel({
      id: entity._id,
      id_category: entity.id_category,
      id_discount: entity.id_discount,
      id_inventory: entity.id_inventory,
      name: entity.name,
      image: entity.image,
      desc: entity.desc,
      price: entity.price,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): ProductModel[] {
    return entities.map(entity => ProductModel.fromEntity(entity));
  }
}
