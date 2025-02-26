/* eslint-disable prettier/prettier */
import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';
import { ProductStatus } from '../schemas/product.schema';

export class ProductModel extends BaseModel {
  id_category: Types.ObjectId;
  id_discount?: Types.ObjectId;
  id_inventory?: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  thumbnail?: string;
  base_price: number;
  min_price: number;
  max_price: number;
  rating?: number;
  total_reviews?: number;
  sold?: number;
  warranty_policy?: boolean;
  status?: ProductStatus;

  constructor(product: any) {
    super(product);
    this.id_category = product.id_category;
    this.id_discount = product.id_discount;
    this.id_inventory = product.id_inventory;
    this.name = product.name;
    this.description = product.description;
    this.image = product.image;
    this.thumbnail = product.thumbnail;
    this.base_price = product.base_price;
    this.min_price = product.min_price;
    this.max_price = product.max_price;
    this.rating = product.rating;
    this.total_reviews = product.total_reviews;
    this.sold = product.sold;
    this.warranty_policy = product.warranty_policy;
    this.status = product.status;
  }

  static fromEntity(entity: any): ProductModel {
    return new ProductModel({
      id: entity._id,
      id_category: entity.id_category,
      id_discount: entity.id_discount,
      id_inventory: entity.id_inventory,
      name: entity.name,
      description: entity.description,
      image: entity.image,
      thumbnail: entity.thumbnail,
      base_price: entity.base_price,
      min_price: entity.min_price,
      max_price: entity.max_price,
      rating: entity.rating,
      total_reviews: entity.total_reviews,
      sold: entity.sold,
      warranty_policy: entity.warranty_policy,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): ProductModel[] {
    return entities.map(entity => ProductModel.fromEntity(entity));
  }
}
