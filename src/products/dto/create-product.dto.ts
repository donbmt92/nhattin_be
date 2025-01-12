import {
  IsMongoId,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'ID của danh mục' })
  @IsMongoId()
  id_category: string;

  @ApiProperty({ description: 'ID của khuyến mãi', required: false })
  @IsMongoId()
  @IsOptional()
  id_discount?: string;

  @ApiProperty({ description: 'ID của inventory', required: false })
  @IsMongoId()
  @IsOptional()
  id_inventory?: string;

  @ApiProperty({ description: 'Tên sản phẩm', minLength: 3, maxLength: 100 })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hình ảnh sản phẩm' })
  @IsString()
  image: string;

  @ApiProperty({ description: 'Mô tả sản phẩm' })
  @IsString()
  desc: string;

  @ApiProperty({ description: 'Giá sản phẩm', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}
