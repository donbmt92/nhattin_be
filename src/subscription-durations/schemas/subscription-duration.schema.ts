/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SubscriptionDurationDocument = SubscriptionDuration & Document;

@Schema({ timestamps: true })
export class SubscriptionDuration {
  @ApiProperty({
    description: 'ID của sản phẩm',
    type: String,
    example: '65abc123def456'
  })
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @ApiProperty({
    description: 'Thời gian sử dụng',
    example: '1 tháng',
    minLength: 2,
    maxLength: 50
  })
  @Prop({ required: true })
  duration: string;

  @ApiProperty({
    description: 'Giá tương ứng với thời hạn (VND)',
    example: 149000,
    minimum: 0
  })
  @Prop({ required: true })
  price: number;

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

export const SubscriptionDurationSchema = SchemaFactory.createForClass(SubscriptionDuration); 