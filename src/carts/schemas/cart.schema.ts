import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uid: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  id_product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart); 