import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ description: 'Tên trang' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Đường dẫn trang' })
  @IsString()
  @IsNotEmpty()
  link: string;
} 