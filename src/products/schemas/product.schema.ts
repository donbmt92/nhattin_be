/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

@Schema({ timestamps: true })
export class Product {
  @ApiProperty({
    description: 'ID của danh mục',
    type: String,
    example: '65abc123def456'
  })
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  id_category: Types.ObjectId;

  @ApiProperty({
    description: 'ID của khuyến mãi',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @Prop({ type: Types.ObjectId, ref: 'Discount', required: false })
  id_discount: Types.ObjectId;

  @ApiProperty({
    description: 'ID của kho hàng',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: false })
  id_inventory: Types.ObjectId;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Tài khoản Netflix Premium',
    minLength: 3,
    maxLength: 100
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Slug của sản phẩm (URL-friendly)',
    example: 'tai-khoan-netflix-premium',
    required: false
  })
  @Prop({ unique: true, sparse: true })
  slug?: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example: 'Tài khoản Netflix Premium chất lượng cao, xem phim không giới hạn'
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh gốc sản phẩm',
    example: 'uploads/products/netflix-premium.jpg'
  })
  @Prop({ required: true })
  image: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh thumbnail sản phẩm',
    example: 'uploads/products/thumb_netflix-premium.jpg',
    required: false
  })
  @Prop()
  thumbnail?: string;

  @ApiProperty({
    description: 'Giá gốc sản phẩm (VND)',
    example: 299000,
    minimum: 0
  })
  @Prop({ required: true })
  base_price: number;

  @ApiProperty({
    description: 'Giá thấp nhất (VND)',
    example: 10000,
    minimum: 0
  })
  @Prop({ required: true })
  min_price: number;

  @ApiProperty({
    description: 'Giá cao nhất (VND)',
    example: 849000,
    minimum: 0
  })
  @Prop({ required: true })
  max_price: number;

  @ApiProperty({
    description: 'Điểm đánh giá trung bình',
    example: 5.0,
    minimum: 0,
    maximum: 5
  })
  @Prop({ default: 0 })
  rating: number;

  @ApiProperty({
    description: 'Số lượng đánh giá',
    example: 173,
    minimum: 0
  })
  @Prop({ default: 0 })
  total_reviews: number;

  @ApiProperty({
    description: 'Số lượng đã bán',
    example: 27268,
    minimum: 0
  })
  @Prop({ default: 0 })
  sold: number;

  @ApiProperty({
    description: 'Chính sách bảo hành',
    example: true,
    type: Boolean
  })
  @Prop({ default: false })
  warranty_policy: boolean;

  @ApiProperty({
    description: 'Tình trạng sản phẩm',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK
  })
  @Prop({ default: ProductStatus.IN_STOCK })
  status: ProductStatus;

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

export const ProductSchema = SchemaFactory.createForClass(Product);
