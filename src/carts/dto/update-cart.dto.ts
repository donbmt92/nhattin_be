import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiProperty({ description: 'New quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
} 