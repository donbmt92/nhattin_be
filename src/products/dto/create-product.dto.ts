/* eslint-disable prettier/prettier */
import {
  IsMongoId,
  IsString,
  IsOptional,
  Length,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsEnum
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../schemas/product.schema';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID của danh mục',
    type: String,
    example: '65abc123def456'
  })
  @IsMongoId()
  id_category: string;

  @ApiProperty({
    description: 'ID của khuyến mãi',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  id_discount?: string;

  @ApiProperty({
    description: 'ID của kho hàng',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  id_inventory?: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Tài khoản Netflix Premium',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example: 'Tài khoản Netflix Premium chất lượng cao, xem phim không giới hạn'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh gốc sản phẩm',
    example: 'uploads/products/netflix-premium.jpg'
  })
  @IsOptional()
  // @IsString()
  image: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh thumbnail sản phẩm',
    example: 'uploads/products/thumb_netflix-premium.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'Giá gốc sản phẩm (VND)',
    example: 299000,
    minimum: 0
  })
  // @IsNumber()
  // @Min(0)
  @IsOptional()
  base_price: number;

  @ApiProperty({
    description: 'Giá thấp nhất (VND)',
    example: 10000,
    minimum: 0
  })
  @IsOptional()
  // @IsNumber()
  // @Min(0)
  min_price: number;

  @ApiProperty({
    description: 'Giá cao nhất (VND)',
    example: 849000,
    minimum: 0
  })
  @IsOptional()
  // @IsNumber()
  // @Min(0)
  max_price: number;

  @ApiProperty({
    description: 'Điểm đánh giá trung bình',
    example: 5.0,
    minimum: 0,
    maximum: 5,
    required: false
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'Số lượng đánh giá',
    example: 173,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  total_reviews?: number;

  @ApiProperty({
    description: 'Số lượng đã bán',
    example: 27268,
    minimum: 0,
    required: false
  })
  // @IsNumber()
  // @Min(0)
  @IsOptional()
  sold?: number;

  @ApiProperty({
    description: 'Chính sách bảo hành',
    example: true,
    type: Boolean,
    required: false
  })
  // @IsBoolean()
  @IsOptional()
  warranty_policy?: boolean;

  @ApiProperty({
    description: 'Tình trạng sản phẩm',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK,
    required: false
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
