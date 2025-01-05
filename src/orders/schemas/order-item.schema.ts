import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderItemDocument = OrderItem & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  id_order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  id_product: Types.ObjectId;

  @Prop({ required: true })
  discount_precent: number;

  @Prop({ required: true })
  old_price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem); 