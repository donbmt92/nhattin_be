/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsISO8601, Min, Max, Length, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDiscountDto {
  @ApiProperty({
    description: 'Tên khuyến mãi',
    minLength: 3,
    maxLength: 50,
    example: 'Khuyến mãi tết',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  @Length(3, 50, { message: 'Tên phải từ 3-50 ký tự' })
  name?: string;

  @ApiProperty({
    description: 'Mô tả khuyến mãi',
    minLength: 10,
    maxLength: 200,
    example: 'Khuyến mãi dịp tết nguyên đán 2024',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @Length(10, 200, { message: 'Mô tả phải từ 10-200 ký tự' })
  desc?: string;

  @ApiProperty({
    description: 'Phần trăm giảm giá',
    minimum: 0,
    maximum: 100,
    example: 10,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Phần trăm giảm giá phải là số' })
  @Min(0, { message: 'Phần trăm giảm giá không được nhỏ hơn 0' })
  @Max(100, { message: 'Phần trăm giảm giá không được lớn hơn 100' })
  @Type(() => Number)
  discount_percent?: number;

  @ApiProperty({
    description: 'Thời gian bắt đầu',
    example: '2024-01-20T00:00:00.000Z',
    type: String,
    required: false
  })
  @IsOptional()
  @IsISO8601({}, { message: 'Thời gian bắt đầu không đúng định dạng ISO8601' })
  @Type(() => Date)
  time_start?: Date;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    example: '2024-02-20T00:00:00.000Z',
    type: String,
    required: false
  })
  @IsOptional()
  @IsISO8601({}, { message: 'Thời gian kết thúc không đúng định dạng ISO8601' })
  @Type(() => Date)
  time_end?: Date;

  @ApiProperty({
    description: 'Trạng thái khuyến mãi',
    minLength: 3,
    maxLength: 20,
    example: 'active',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  @Length(3, 20, { message: 'Trạng thái phải từ 3-20 ký tự' })
  status?: string;
} 