/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderItemDocument = OrderItem & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  id_order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  id_product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  old_price: number;

  @Prop({ default: 0 })
  discount_precent: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
