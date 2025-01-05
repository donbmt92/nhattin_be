import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  id_socket: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  tag: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  type_user: string;

  @Prop()
  avatar: string;

  @Prop()
  note: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  state: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 