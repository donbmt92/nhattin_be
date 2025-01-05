import { IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  id_product: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
} 