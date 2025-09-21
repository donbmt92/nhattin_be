import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { PaymentStatus } from '../enum/payment-status.enum';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID của đơn hàng' })
  // @IsMongoId()
  // @IsNotEmpty()
  @Allow()
  id_order: string;

  @ApiProperty({ description: 'Nhà cung cấp thanh toán' })
  // @IsString()
  // @IsNotEmpty()
  @Allow()
  provider: string;

  @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus })
  // @IsEnum(PaymentStatus)
  @Allow()
  status: PaymentStatus;

  @ApiProperty({ description: 'Số tiền thanh toán', minimum: 0 })
  // @IsNumber()
  // @Min(0)
  // @IsNotEmpty()
  @Allow()
  amount: number;

  @ApiProperty({ description: 'Đánh dấu là thanh toán chuyển khoản', required: false, default: false })
  // @IsBoolean()
  // @IsOptional()
  @Allow()
  is_bank_transfer?: boolean;

  @ApiProperty({ description: 'Tên ngân hàng', required: false })
  // @IsString()
  // @IsOptional()
  @Allow()
  bank_name?: string;

  @ApiProperty({ description: 'Mã giao dịch', required: false })
  // @IsString()
  // @IsOptional()
  @Allow()
  transaction_reference?: string;

  @ApiProperty({ description: 'Ngày chuyển khoản', required: false })
  // @IsDateString()
  // @IsOptional()
  @Allow()
  transfer_date?: string;

  @ApiProperty({ description: 'Ghi chú chuyển khoản', required: false })
  // @IsString()
  // @IsOptional()
  @Allow()
  transfer_note?: string;
}
