import { IsString, Length, IsNumber, Min, Max, IsDate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDiscountDto {
  @ApiProperty({
    description: 'Tên khuyến mãi',
    minLength: 3,
    maxLength: 50,
    example: 'Khuyến mãi tết'
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    description: 'Mô tả khuyến mãi',
    minLength: 10,
    maxLength: 200,
    example: 'Khuyến mãi dịp tết nguyên đán 2024'
  })
  @IsString()
  @Length(10, 200)
  desc: string;

  @ApiProperty({
    description: 'Phần trăm giảm giá',
    minimum: 0,
    maximum: 100,
    example: 10
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent: number;

  @ApiProperty({
    description: 'Thời gian bắt đầu',
    example: '2024-01-20T00:00:00.000Z'
  })
  @IsDate()
  time_start: Date;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    example: '2024-02-20T00:00:00.000Z'
  })
  @IsDate()
  time_end: Date;

  @ApiProperty({
    description: 'Trạng thái khuyến mãi',
    minLength: 3,
    maxLength: 20,
    example: 'active'
  })
  @IsString()
  @Length(3, 20)
  status: string;
}
