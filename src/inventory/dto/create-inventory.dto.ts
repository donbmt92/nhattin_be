import { IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({ description: 'ID của kho' })
  @IsMongoId()
  id_warehouse: string;

  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsMongoId()
  id_product: string;

  @ApiProperty({ description: 'Số lượng', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;
} 