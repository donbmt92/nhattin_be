import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserRole } from './enum/role.enum';
import { UserStatus } from './enum/status.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: string;

  @Prop({ required: false, type: String })
  fullName: string;

  @Prop({ required: true, type: String })
  phone: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: false, type: [String] })
  jwt: string[];

  @Prop({ required: false, type: String, default: UserRole.USER })
  role: string;

  @Prop({ required: false, type: String, default: UserStatus.ACTIVE })
  isDelete: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
