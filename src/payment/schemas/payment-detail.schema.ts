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
}

export const PaymentDetailSchema = SchemaFactory.createForClass(PaymentDetail);

// Index cho tìm kiếm theo order
PaymentDetailSchema.index({ id_order: 1 });
