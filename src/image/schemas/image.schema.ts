import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ImageDocument = Image & Document;

@Schema({ timestamps: true })
export class Image {
  @ApiProperty({
    description: 'Loại hình ảnh',
    example: 'product',
    enum: ['product', 'category', 'banner', 'avatar'],
  })
  @Prop({ required: true })
  type: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh',
    example: 'uploads/products/image.jpg',
  })
  @Prop({ required: true })
  link: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh thumbnail',
    example: 'uploads/products/thumb_image.jpg',
    required: false,
  })
  @Prop()
  thumbnail?: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000,
  })
  @Prop({ required: true })
  size: number;

  @ApiProperty({
    description: 'Loại file',
    example: 'image/jpeg',
  })
  @Prop({ required: true })
  mimeType: string;

  @ApiProperty({
    description: 'Chiều rộng hình ảnh (px)',
    example: 800,
    required: false,
  })
  @Prop()
  width?: number;

  @ApiProperty({
    description: 'Chiều cao hình ảnh (px)',
    example: 600,
    required: false,
  })
  @Prop()
  height?: number;

  @ApiProperty({
    description: 'Tên file gốc',
    example: 'my-image.jpg',
  })
  @Prop({ required: true })
  originalName: string;

  @ApiProperty({
    description: 'Tên file trên hệ thống',
    example: '1647832153123-123456789.jpg',
  })
  @Prop({ required: true })
  fileName: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-03-20T03:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2024-03-20T03:00:00.000Z',
  })
  updatedAt?: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
