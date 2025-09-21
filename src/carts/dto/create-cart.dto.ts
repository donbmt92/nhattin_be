/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

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

  // Subscription fields
  @ApiProperty({
    description: 'ID của subscription type',
    required: false,
    example: '65f2e0a3a2e0c60c848d3e15'
  })
  @IsOptional()
  @IsString()
  subscription_type_id?: string;

  @ApiProperty({
    description: 'ID của subscription duration',
    required: false,
    example: '65f2e0a3a2e0c60c848d3e16'
  })
  @IsOptional()
  @IsString()
  subscription_duration_id?: string;

  @ApiProperty({
    description: 'Tên subscription type',
    required: false,
    example: 'Premium'
  })
  @IsOptional()
  @IsString()
  subscription_type_name?: string;

  @ApiProperty({
    description: 'Thời hạn subscription',
    required: false,
    example: '1 tháng'
  })
  @IsOptional()
  @IsString()
  subscription_duration?: string;

  @ApiProperty({
    description: 'Số ngày của subscription',
    required: false,
    example: 30
  })
  @IsOptional()
  @IsNumber()
  subscription_days?: number;

  @ApiProperty({
    description: 'Giá của subscription duration',
    required: false,
    example: 149000
  })
  @IsOptional()
  @IsNumber()
  subscription_price?: number;
} 