import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageDocument = Page & Document;

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
export class Page {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  link: string;
}

export const PageSchema = SchemaFactory.createForClass(Page);

// Index cho tìm kiếm theo name và link
PageSchema.index({ name: 1 });
PageSchema.index({ link: 1 }); 