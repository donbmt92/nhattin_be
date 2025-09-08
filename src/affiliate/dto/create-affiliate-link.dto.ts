import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsMongoId, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAffiliateLinkDto {
  @ApiProperty({
    description: 'ID của sản phẩm muốn tạo link affiliate',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Thời gian hết hạn của link (ISO string hoặc Date)',
    example: '2024-12-31T23:59:59.000Z'
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
    return value;
  })
  @IsDate({ message: 'expiresAt phải là định dạng ngày tháng hợp lệ' })
  expiresAt: Date;

  @ApiProperty({
    description: 'Tên chiến dịch (tùy chọn)',
    example: 'Black Friday Sale 2024',
    required: false
  })
  @IsOptional()
  @IsString()
  campaignName?: string;

  @ApiProperty({
    description: 'Ghi chú (tùy chọn)',
    example: 'Link cho sản phẩm hot nhất tháng 12',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AffiliateLinkResponseDto {
  @ApiProperty({ description: 'ID của link affiliate' })
  id: string;

  @ApiProperty({ description: 'Mã link affiliate' })
  linkCode: string;

  @ApiProperty({ description: 'URL gốc của sản phẩm' })
  originalUrl: string;

  @ApiProperty({ description: 'URL rút gọn cho affiliate' })
  shortUrl: string;

  @ApiProperty({ description: 'Thời gian hết hạn' })
  expiresAt: Date;

  @ApiProperty({ description: 'Số lần click' })
  clickCount: number;

  @ApiProperty({ description: 'Số lần chuyển đổi' })
  conversionCount: number;

  @ApiProperty({ description: 'Tổng hoa hồng kiếm được' })
  totalCommissionEarned: number;

  @ApiProperty({ description: 'Trạng thái link' })
  status: string;

  @ApiProperty({ description: 'Tên chiến dịch' })
  campaignName?: string;

  @ApiProperty({ description: 'Ghi chú' })
  notes?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt: Date;
}
