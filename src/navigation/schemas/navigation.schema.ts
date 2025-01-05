import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NavigationDocument = Navigation & Document;

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
export class Navigation {
  @Prop({ type: Types.ObjectId, ref: 'Page', required: true, index: true })
  id_page: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sub_page: string;

  @Prop({ required: true, index: true })
  position: number;

  @Prop({ required: true })
  link: string;
}

export const NavigationSchema = SchemaFactory.createForClass(Navigation);

// Compound index cho tìm kiếm navigation theo page và position
NavigationSchema.index({ id_page: 1, position: 1 }); 