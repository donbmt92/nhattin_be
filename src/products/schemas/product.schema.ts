import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

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
    example: 'Áo thun nam',
    minLength: 3,
    maxLength: 100
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ 
    description: 'Đường dẫn hình ảnh gốc sản phẩm',
    example: 'uploads/products/ao-thun-nam.jpg'
  })
  @Prop({ required: true })
  image: string;

  @ApiProperty({ 
    description: 'Đường dẫn hình ảnh thumbnail sản phẩm',
    example: 'uploads/products/thumb_ao-thun-nam.jpg',
    required: false
  })
  @Prop()
  thumbnail?: string;

  @ApiProperty({ 
    description: 'Mô tả chi tiết sản phẩm',
    example: 'Áo thun nam cotton 100%, form regular fit'
  })
  @Prop({ required: true })
  desc: string;

  @ApiProperty({ 
    description: 'Giá sản phẩm (VND)',
    example: 199000,
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

export const ProductSchema = SchemaFactory.createForClass(Product);
