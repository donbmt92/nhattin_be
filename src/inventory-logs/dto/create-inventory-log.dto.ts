import { IsString, IsNumber, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryLogDto {
  @ApiProperty({ description: 'ID của inventory' })
  @IsMongoId()
  @IsNotEmpty()
  id_inventory: string;

  @ApiProperty({ description: 'Số lượng thay đổi' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Ghi chú' })
  @IsString()
  note: string;

  @ApiProperty({ description: 'Loại giao dịch' })
  @IsString()
  @IsNotEmpty()
  transaction_type: string;
} 