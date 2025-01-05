import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateIf,
  Min,
} from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    required: true,
    description: 'page',
    example: 1,
  })
  @Min(1)
  @IsNumber()
  @Transform((obj) => (obj.value ? parseInt(obj.value, 10) : 1))
  page: number = 1;
  @ApiProperty({
    required: true,
    description: 'limit',
    example: 10,
  })
  @Min(1)
  @IsNumber()
  @Transform((obj) => (obj.value ? parseInt(obj.value, 10) : 10))
  limit: number = 10;
  @ApiProperty({
    required: false,
    default: '',
  })
  oderBy?: string;

  @ApiProperty({
    required: false,
    default: '',
  })
  query?: string = '';
}
