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
  @Prop({ type: Types.ObjectId, ref: 'Order', required: false, index: true })
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

  // 🔥 NEW: Order snapshot data để lưu thông tin đơn hàng trực tiếp
  @Prop({ type: Object, required: false })
  order_snapshot?: {
    id: string;
    uid: string;
    status: string;
    total_items: number;
    note: string;
    voucher?: string;
    affiliateCode?: string;
    commissionAmount?: number;
    commissionStatus?: string;
    createdAt: Date;
    updatedAt: Date;
    items?: Array<{
      id: string;
      quantity: number;
      old_price: number;
      discount_precent: number;
      final_price: number;
      product_snapshot: {
        name: string;
        image: string;
        description: string;
        base_price: number;
        category_id: string;
        category_name: string;
      };
    }>;
  };
}

export const PaymentDetailSchema = SchemaFactory.createForClass(PaymentDetail);

// Index cho tìm kiếm theo order
PaymentDetailSchema.index({ id_order: 1 });
