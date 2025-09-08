import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AffiliateDocument = Affiliate & Document & { _id: mongoose.Types.ObjectId };

@Schema({ timestamps: true })
export class Affiliate {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true, unique: true, index: true })
  affiliateCode: string;

  @Prop({ type: Number, required: true, min: 1, max: 20, default: 8 })
  commissionRate: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalEarnings: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReferrals: number;

  @Prop({ type: Number, default: 0, min: 0 })
  approvedReferrals: number;

  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' })
  status: string;

  @Prop({
    type: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountHolder: { type: String, required: true },
      bankCode: { type: String, required: false }
    }
  })
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankCode?: string;
  };

  @Prop({ type: Number, default: 100000, min: 50000 })
  minPayoutAmount: number;

  @Prop({ type: Date })
  lastPayoutDate?: Date;

  @Prop({ type: String })
  notes?: string;
}

export const AffiliateSchema = SchemaFactory.createForClass(Affiliate);

// Create indexes for performance
AffiliateSchema.index({ userId: 1 });
AffiliateSchema.index({ affiliateCode: 1 });
AffiliateSchema.index({ status: 1 });
AffiliateSchema.index({ totalEarnings: -1 });
