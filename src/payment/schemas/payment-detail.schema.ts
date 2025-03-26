import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDetailDocument = PaymentDetail & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class PaymentDetail {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  id_order: Types.ObjectId;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Boolean, default: false })
  is_bank_transfer: boolean;

  @Prop({ type: String, required: false })
  bank_name: string;

  @Prop({ type: String, required: false })
  transaction_reference: string;

  @Prop({ type: Date, required: false })
  transfer_date: Date;

  @Prop({ type: String, required: false })
  transfer_note: string;
}

export const PaymentDetailSchema = SchemaFactory.createForClass(PaymentDetail);

// Index cho tìm kiếm theo order
PaymentDetailSchema.index({ id_order: 1 });
