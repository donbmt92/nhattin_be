import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Số lượng mới', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;
} 