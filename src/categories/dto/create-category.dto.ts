/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { CategoryStatus } from '../schemas/category.schema';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Tài khoản Netflix',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Loại danh mục',
    example: 'NETFLIX',
    required: true
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Trạng thái danh mục',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    required: false
  })
  @IsEnum(CategoryStatus)
  @IsOptional()
  status?: CategoryStatus;

  @ApiProperty({
    description: 'URL hình ảnh danh mục',
    example: 'https://res.cloudinary.com/example/image/upload/v1234567/categories/category1.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  image?: string;
} 