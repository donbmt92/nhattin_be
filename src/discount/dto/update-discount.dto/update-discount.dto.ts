import { IsDate, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class UpdateDiscountDto {
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsString()
  @Length(10, 200)
  desc?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsDate()
  time_start?: Date;

  @IsDate()
  time_end?: Date;

  @IsString()
  @Length(3, 20)
  status?: string;
}
