/* eslint-disable prettier/prettier */
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
  original_price?: number;
  current_price?: number;

  constructor(product: any) {
    super(product);
    this.id_category = product.id_category;
    this.id_discount = product.id_discount;
    this.id_inventory = product.id_inventory;
    this.name = product.name;
    this.image = product.image;
    this.desc = product.desc;
    this.price = product.price;
    this.original_price = product.original_price;
    this.current_price = product.current_price;
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
      original_price: entity.original_price,
      current_price: entity.current_price,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): ProductModel[] {
    
    return entities.map(entity => ProductModel.fromEntity(entity));
  }

}
