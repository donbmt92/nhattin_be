import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  id_category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Discount', required: false })
  id_discount: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: false })
  id_inventory: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
