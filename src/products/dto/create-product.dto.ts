import {
  IsMongoId,
  IsString,
  IsOptional,
  Length,
  IsNumber,
  Min
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID của danh mục',
    example: '65abc123def456'
  })
  @IsMongoId()
  id_category: string;

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
    maxLength: 100
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    description: 'Giá sản phẩm (VND)',
    example: 199000,
    required: false
  })
  @IsOptional()
  price: number;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example: 'Áo thun nam cotton 100%'
  })
  @IsString()
  desc: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File ảnh sản phẩm (jpg, png, jpeg)',
    required: true
  })
  @IsOptional()
  image: any;
}
