import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true })
export class Referral {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true, index: true })
  affiliateId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  referredUserId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  referredUserEmail: string;

  @Prop({ type: String, required: true, index: true })
  referredUserPhone: string;

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Number, default: 0, min: 0 })
  commissionEarned: number;

  @Prop({ type: Date })
  approvedDate?: Date;

  @Prop({ type: Date })
  conversionDate?: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  totalOrderValue: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalOrders: number;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  rejectionReason?: string;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

// Create indexes for performance
ReferralSchema.index({ affiliateId: 1 });
ReferralSchema.index({ referredUserId: 1 });
ReferralSchema.index({ referredUserEmail: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ createdAt: -1 });
