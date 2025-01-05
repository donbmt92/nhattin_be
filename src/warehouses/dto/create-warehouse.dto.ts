import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Tên kho', minLength: 3, maxLength: 100 })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({ description: 'Địa chỉ kho', minLength: 5, maxLength: 200 })
  @IsString()
  @Length(5, 200)
  location: string;
} 