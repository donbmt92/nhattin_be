import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Loại danh mục' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Tên danh mục' })
  @IsString()
  @IsNotEmpty()
  name: string;
} 