/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsMongoId, Min, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateSubscriptionDurationDto {
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
    description: 'ID của loại gói đăng ký',
    type: String,
    example: '65abc123def456',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  subscription_type_id?: string;

  @ApiProperty({
    description: 'Thời gian sử dụng',
    example: '1 tháng',
    minLength: 2,
    maxLength: 50,
    required: false
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  duration?: string;

  @ApiProperty({
    description: 'Giá tương ứng với thời hạn (VND)',
    example: 149000,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Số ngày của thời hạn',
    example: 30,
    minimum: 1,
    required: false
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  days?: number;
}
