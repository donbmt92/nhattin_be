/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsMongoId, MinLength, MaxLength } from 'class-validator';
import { SubscriptionTypeStatus } from '../schemas/subscription-type.schema';

export class CreateSubscriptionTypeDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    type: String,
    example: '65abc123def456'
  })
  @IsMongoId()
  product_id: string;

  @ApiProperty({
    description: 'Tên gói đăng ký',
    example: 'Premium',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  type_name: string;

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