/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsMongoId, MinLength, MaxLength } from 'class-validator';
import { SubscriptionTypeStatus } from '../schemas/subscription-type.schema';

export class UpdateSubscriptionTypeDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  product_id?: string;

  @ApiProperty({
    description: 'Tên gói đăng ký',
    example: 'Premium',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  type_name?: string;

  @ApiProperty({
    description: 'Tên hiển thị của gói đăng ký',
    example: 'Gói Cao cấp',
    minLength: 2,
    maxLength: 100,
    required: false
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về gói đăng ký',
    example: 'Gói dịch vụ cao cấp với đầy đủ tính năng',
    maxLength: 500,
    required: false
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Trạng thái gói đăng ký',
    enum: SubscriptionTypeStatus,
    default: SubscriptionTypeStatus.ACTIVE,
    required: false
  })
  @IsEnum(SubscriptionTypeStatus)
  @IsOptional()
  status?: SubscriptionTypeStatus;
}
