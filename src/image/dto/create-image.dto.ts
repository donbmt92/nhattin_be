import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ description: 'Loại hình ảnh' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Đường dẫn hình ảnh' })
  @IsString()
  @IsNotEmpty()
  link: string;
}
