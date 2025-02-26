/* eslint-disable prettier/prettier */

import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, IsNumber, Min, IsOptional, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({ 
    description: 'ID của danh mục',
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  id_category?: string;

  @ApiProperty({ 
    description: 'ID của khuyến mãi',
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  id_discount?: string;

  @ApiProperty({ 
    description: 'ID của kho hàng',
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  id_inventory?: string;

  @ApiProperty({ 
    description: 'Tên sản phẩm',
    example: 'Áo thun nam',
    minLength: 3,
    maxLength: 100,
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

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
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({ 
    description: 'Giá gốc sản phẩm (VND)',
    example: 299000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  base_price?: number;

  @ApiProperty({ 
    description: 'Giá thấp nhất (VND)',
    example: 10000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  min_price?: number;

  @ApiProperty({ 
    description: 'Giá cao nhất (VND)',
    example: 849000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  max_price?: number;
} 