import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiscountDocument = Discount & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Discount {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true, min: 0, max: 100 })
  discount_precent: number;

  @Prop({ required: true, index: true })
  time_start: Date;

  @Prop({ required: true, index: true })
  time_end: Date;

  @Prop({ 
    required: true, 
    enum: ['active', 'inactive', 'scheduled', 'expired'],
    default: 'inactive',
    index: true
  })
  status: string;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

// Tạo compound index cho tìm kiếm khuyến mãi active
DiscountSchema.index({ 
  status: 1, 
  time_start: 1, 
  time_end: 1 
}); 