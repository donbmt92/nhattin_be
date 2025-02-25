/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsMongoId, Min, MinLength, MaxLength } from 'class-validator';

export class CreateSubscriptionDurationDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    type: String,
    example: '65abc123def456'
  })
  @IsMongoId()
  product_id: string;

  @ApiProperty({
    description: 'Thời gian sử dụng',
    example: '1 tháng',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  duration: string;

  @ApiProperty({
    description: 'Giá tương ứng với thời hạn (VND)',
    example: 149000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;
} 