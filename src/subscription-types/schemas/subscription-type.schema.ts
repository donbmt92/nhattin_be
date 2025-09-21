/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SubscriptionTypeDocument = SubscriptionType & Document;

export enum SubscriptionTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ timestamps: true })
export class SubscriptionType {
  @ApiProperty({
    description: 'ID của sản phẩm',
    type: String,
    example: '65abc123def456'
  })
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @ApiProperty({
    description: 'Tên gói đăng ký',
    example: 'Premium',
    minLength: 2,
    maxLength: 50
  })
  @Prop({ required: true })
  type_name: string;

  @ApiProperty({
    description: 'Tên hiển thị của gói đăng ký',
    example: 'Gói Cao cấp',
    minLength: 2,
    maxLength: 100,
    required: false
  })
  @Prop({ required: false })
  name?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về gói đăng ký',
    example: 'Gói dịch vụ cao cấp với đầy đủ tính năng',
    maxLength: 500,
    required: false
  })
  @Prop({ required: false })
  description?: string;

  @ApiProperty({
    description: 'Trạng thái gói đăng ký',
    enum: SubscriptionTypeStatus,
    default: SubscriptionTypeStatus.ACTIVE
  })
  @Prop({ default: SubscriptionTypeStatus.ACTIVE })
  status: SubscriptionTypeStatus;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-03-20T03:00:00.000Z'
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2024-03-20T03:00:00.000Z'
  })
  updatedAt?: Date;
}

export const SubscriptionTypeSchema = SchemaFactory.createForClass(SubscriptionType); 