import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../enum/order-status.enum';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uid: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: false })
  id_payment: Types.ObjectId;

  @Prop({ required: true })
  note: string;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop()
  voucher: string;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 