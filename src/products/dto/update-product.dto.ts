/* eslint-disable prettier/prettier */

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ 
    description: 'ID của danh mục',
    example: '65abc123def456',
    required: false
  })
  @IsOptional()
  id_category?: string;

  @ApiProperty({ 
    description: 'ID của khuyến mãi',
    example: '65abc123def456',
    required: false
  })
  @IsOptional()
  id_discount?: string;

  @ApiProperty({ 
    description: 'ID của kho hàng',
    example: '65abc123def456',
    required: false
  })
  @IsOptional()
  id_inventory?: string;

  @ApiProperty({ 
    description: 'Tên sản phẩm',
    example: 'Áo thun nam',
    minLength: 3,
    maxLength: 100,
    required: false
  })
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Slug của sản phẩm (URL-friendly)',
    example: 'tai-khoan-netflix-premium',
    required: false
  })
  @IsOptional()
  slug?: string;

  @ApiProperty({ 
    type: 'string',
    format: 'binary',
    description: 'File ảnh sản phẩm mới (jpg, png, jpeg)',
    required: false
  })
  @IsOptional()
  image?: any;

  @ApiProperty({ 
    description: 'Mô tả sản phẩm',
    example: 'Áo thun nam cotton 100%, form regular fit',
    required: false
  })
  @IsOptional()
  desc?: string;

  @ApiProperty({ 
    description: 'Mô tả sản phẩm',
    example: 'Áo thun nam cotton 100%, form regular fit',
    required: false
  })
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Giá gốc sản phẩm (VND)',
    example: 299000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsOptional()
  base_price?: number;

  @ApiProperty({ 
    description: 'Giá thấp nhất (VND)',
    example: 10000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsOptional()
  min_price?: number;

  @ApiProperty({ 
    description: 'Giá cao nhất (VND)',
    example: 849000,
    minimum: 0,
    required: false,
    type: Number
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