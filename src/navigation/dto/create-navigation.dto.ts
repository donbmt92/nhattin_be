import { IsString, IsNumber, Min, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNavigationDto {
  @ApiProperty({ description: 'ID của trang' })
  @IsMongoId()
  id_page: string;

  @ApiProperty({ description: 'Tên navigation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Sub page' })
  @IsString()
  @IsNotEmpty()
  sub_page: string;

  @ApiProperty({ description: 'Vị trí hiển thị', minimum: 0 })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiProperty({ description: 'Đường dẫn' })
  @IsString()
  @IsNotEmpty()
  link: string;
} 