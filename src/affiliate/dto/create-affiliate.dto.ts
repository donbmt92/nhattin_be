import { IsString, IsNumber, IsObject, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentInfoDto {
  @ApiProperty({ description: 'Tên ngân hàng', example: 'Vietcombank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ description: 'Số tài khoản', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ description: 'Tên chủ tài khoản', example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  accountHolder: string;

  @ApiProperty({ description: 'Mã ngân hàng', example: 'VCB', required: false })
  @IsString()
  @IsOptional()
  bankCode?: string;
}

export class CreateAffiliateDto {
  @ApiProperty({ description: 'Tỷ lệ hoa hồng (%)', example: 8, minimum: 1, maximum: 20 })
  @IsNumber()
  @Min(1)
  @Max(20)
  commissionRate: number;

  @ApiProperty({ description: 'Thông tin thanh toán', type: PaymentInfoDto })
  @IsObject()
  paymentInfo: PaymentInfoDto;

  @ApiProperty({ description: 'Ghi chú', example: 'Tôi muốn tham gia chương trình affiliate', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
