import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  thumbnail?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  slug?: string;

  @Prop({ default: 0 })
  views?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PostCategory', required: true })
  category: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: MongooseSchema.Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post); 