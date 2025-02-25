/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '65abc123def456'
  })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  product_id: string;

  @ApiProperty({
    description: 'ID của loại gói đăng ký',
    example: '65abc123def456'
  })
  @IsNotEmpty({ message: 'ID loại gói đăng ký không được để trống' })
  @IsString({ message: 'ID loại gói đăng ký phải là chuỗi' })
  subscription_type_id: string;

  @ApiProperty({
    description: 'ID của thời hạn gói đăng ký',
    example: '65abc123def456'
  })
  @IsNotEmpty({ message: 'ID thời hạn gói đăng ký không được để trống' })
  @IsString({ message: 'ID thời hạn gói đăng ký phải là chuỗi' })
  subscription_duration_id: string;

  @ApiProperty({
    description: 'Ghi chú cho đăng ký',
    example: 'Đăng ký cho dự án ABC',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  notes?: string;
} 