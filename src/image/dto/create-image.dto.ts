import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'Loại hình ảnh',
    example: 'product',
    enum: ['product', 'category', 'banner', 'avatar'],
    required: true
  })
  @IsEnum(['product', 'category', 'banner', 'avatar'])
  type: string;

  @ApiProperty({
    description: 'File hình ảnh',
    type: 'string',
    format: 'binary',
    required: true
  })
  file: Express.Multer.File;
}
