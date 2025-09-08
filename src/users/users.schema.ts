import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Role } from './enum/role.enum';
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

  @Prop({ required: false, type: String, default: Role.USER })
  role: string;

  @Prop({ required: false, type: String, default: UserStatus.ACTIVE })
  isDelete: string;

  @Prop({ required: false, type: String })
  image: string;

  // 🔥 NEW: Affiliate fields
  @Prop({ type: String, unique: true, sparse: true, index: true })
  affiliateCode?: string;
  
  @Prop({ type: Boolean, default: false, index: true })
  isAffiliate?: boolean;
  
  @Prop({ type: String, index: true })
  referredBy?: string;
  
  @Prop({ type: Date })
  affiliateJoinDate?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
