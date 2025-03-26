import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostCategoryDocument = PostCategory & Document;

@Schema({ timestamps: true })
export class PostCategory {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  slug?: string;
}

export const PostCategorySchema = SchemaFactory.createForClass(PostCategory); 