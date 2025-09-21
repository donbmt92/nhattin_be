/* eslint-disable prettier/prettier */
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

  // Subscription fields
  @Prop({ type: Types.ObjectId, ref: 'SubscriptionType', required: false })
  subscription_type_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionDuration', required: false })
  subscription_duration_id?: Types.ObjectId;

  @Prop({ required: false })
  subscription_type_name?: string;

  @Prop({ required: false })
  subscription_duration?: string;

  @Prop({ required: false })
  subscription_days?: number;

  @Prop({ required: false })
  subscription_price?: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
