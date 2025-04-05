/* eslint-disable prettier/prettier */
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID của danh mục',
    type: String,
    example: '65abc123def456'
  })
  @IsOptional()
  id_category: string;

  @ApiProperty({
    description: 'ID của khuyến mãi',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @IsOptional()
  id_discount?: string;

  @ApiProperty({
    description: 'ID của kho hàng',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @IsOptional()
  id_inventory?: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Tài khoản Netflix Premium',
    minLength: 3,
    maxLength: 100
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example: 'Tài khoản Netflix Premium chất lượng cao, xem phim không giới hạn'
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh gốc sản phẩm',
    example: 'uploads/products/netflix-premium.jpg',
    required: false
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh thumbnail sản phẩm',
    example: 'uploads/products/thumb_netflix-premium.jpg',
    required: false
  })
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'Giá gốc sản phẩm (VND)',
    example: 299000,
    minimum: 0,
    required: false
  })
  @IsOptional()
  base_price?: number;

  @ApiProperty({
    description: 'Giá thấp nhất (VND)',
    example: 10000,
    minimum: 0,
    required: false
  })
  @IsOptional()
  min_price?: number;

  @ApiProperty({
    description: 'Giá cao nhất (VND)',
    example: 849000,
    minimum: 0,
    required: false
  })
  @IsOptional()
  max_price?: number;

  @ApiProperty({
    description: 'Điểm đánh giá trung bình',
    example: 5.0,
    minimum: 0,
    maximum: 5,
    required: false
  })
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'Số lượng đánh giá',
    example: 173,
    minimum: 0,
    required: false
  })
  @IsOptional()
  total_reviews?: number;

  @ApiProperty({
    description: 'Số lượng đã bán',
    example: 27268,
    minimum: 0,
    required: false
  })
  @IsOptional()
  sold?: number;

  @ApiProperty({
    description: 'Chính sách bảo hành',
    example: true,
    type: Boolean,
    required: false
  })
  @IsOptional()
  warranty_policy?: boolean;

  @ApiProperty({
    description: 'Tình trạng sản phẩm',
    enum: ['IN_STOCK', 'OUT_OF_STOCK'],
    default: 'IN_STOCK',
    required: false
  })
  @IsOptional()
  status?: string;
}
