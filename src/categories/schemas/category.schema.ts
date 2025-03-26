/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CategoryDocument = Category & Document;

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Schema({ timestamps: true })
export class Category {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Tài khoản Netflix',
    minLength: 2,
    maxLength: 50
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Trạng thái danh mục',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE
  })
  @Prop({ default: CategoryStatus.ACTIVE })
  status: CategoryStatus;

  @ApiProperty({
    description: 'URL hình ảnh danh mục',
    example: 'https://res.cloudinary.com/example/image/upload/v1234567/categories/category1.jpg'
  })
  @Prop()
  image?: string;

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

export const CategorySchema = SchemaFactory.createForClass(Category); 