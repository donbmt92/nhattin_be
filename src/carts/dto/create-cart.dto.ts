/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '6783986205306e7b3a633bdb'
  })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  id_product: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    minimum: 1,
    example: 1
  })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
} 