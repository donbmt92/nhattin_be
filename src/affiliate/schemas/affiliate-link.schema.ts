import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type AffiliateLinkDocument = AffiliateLink & Document;

@Schema({ timestamps: true })
export class AffiliateLink {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true, index: true })
  affiliateId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true, unique: true, index: true })
  linkCode: string;

  @Prop({ type: String, required: true })
  originalUrl: string;

  @Prop({ type: String, required: true })
  shortUrl: string;

  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  clickCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  conversionCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalCommissionEarned: number;

  @Prop({ type: String, enum: ['ACTIVE', 'EXPIRED', 'DISABLED'], default: 'ACTIVE', index: true })
  status: string;

  @Prop({ type: String })
  campaignName?: string;

  @Prop({ type: String })
  notes?: string;

  // Tracking metadata
  @Prop({ type: [String], default: [] })
  clickedByIPs: string[];

  @Prop({ type: [String], default: [] })
  convertedUserIds: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const AffiliateLinkSchema = SchemaFactory.createForClass(AffiliateLink);

// Index for efficient queries
AffiliateLinkSchema.index({ affiliateId: 1, productId: 1 });
AffiliateLinkSchema.index({ expiresAt: 1, status: 1 });
AffiliateLinkSchema.index({ linkCode: 1 }, { unique: true });
