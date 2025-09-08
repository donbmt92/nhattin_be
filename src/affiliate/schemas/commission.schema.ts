import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type CommissionTransactionDocument = CommissionTransaction & Document;

@Schema({ timestamps: true })
export class CommissionTransaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true, index: true })
  affiliateId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Referral', required: true, index: true })
  referralId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  orderAmount: number;

  @Prop({ type: Number, required: true, min: 0 })
  commission: number;

  @Prop({ type: Number, required: true, min: 0 })
  commissionRate: number;

  @Prop({ type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Date })
  paidDate?: Date;

  @Prop({ type: String, enum: ['QR_CODE', 'BANK_TRANSFER', 'WALLET', 'CASH'] })
  paymentMethod?: string;

  @Prop({ type: String })
  paymentReference?: string;

  @Prop({ type: String })
  notes?: string;
}

export const CommissionSchema = SchemaFactory.createForClass(CommissionTransaction);

// Create indexes for performance
CommissionSchema.index({ affiliateId: 1 });
CommissionSchema.index({ orderId: 1 });
CommissionSchema.index({ referralId: 1 });
CommissionSchema.index({ status: 1 });
CommissionSchema.index({ createdAt: -1 });
