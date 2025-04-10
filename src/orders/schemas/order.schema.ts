/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../enum/order-status.enum';

export interface IOrder {
  _id: Types.ObjectId;
  uid: Types.ObjectId;
  id_payment?: Types.ObjectId;
  note: string;
  voucher?: string;
  status: OrderStatus;
  total_items: number;
  items: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = IOrder & Document;

@Schema({ timestamps: true })
export class Order implements IOrder {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  uid: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: false, index: true })
  id_payment?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  note: string;

  // @Prop({ required: true, min: 0, default: 0 })
  // total: number;

  @Prop({ trim: true })
  voucher?: string;

  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    index: true
  })
  status: OrderStatus;

  @Prop({ default: 0 })
  total_items: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrderItem' }], default: [] })
  items: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Create compound index for common queries
OrderSchema.index({ uid: 1, status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
