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
    description: 'Giá sản phẩm (VND)',
    example: 199000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  price?: number;

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
  original_price?: number;

  @ApiProperty({ 
    description: 'Giá hiện tại sản phẩm (VND)',
    example: 179000,
    minimum: 0,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  current_price?: number;
} 