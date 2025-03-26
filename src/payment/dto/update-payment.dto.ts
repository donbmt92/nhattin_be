import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { PaymentStatus } from '../enum/payment-status.enum';

export class UpdatePaymentDto {
  @ApiProperty({ description: 'ID của đơn hàng', required: false })
  @Allow()
  id_order?: string;

  @ApiProperty({ description: 'Nhà cung cấp thanh toán', required: false })
  @Allow()
  provider?: string;

  @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus, required: false })
  @Allow()
  status?: PaymentStatus;

  @ApiProperty({ description: 'Số tiền thanh toán', minimum: 0, required: false })
  @Allow()
  amount?: number;

  @ApiProperty({ description: 'Đánh dấu là thanh toán chuyển khoản', required: false, default: false })
  @Allow()
  is_bank_transfer?: boolean;

  @ApiProperty({ description: 'Tên ngân hàng', required: false })
  @Allow()
  bank_name?: string;

  @ApiProperty({ description: 'Mã giao dịch', required: false })
  @Allow()
  transaction_reference?: string;

  @ApiProperty({ description: 'Ngày chuyển khoản', required: false })
  @Allow()
  transfer_date?: string;

  @ApiProperty({ description: 'Ghi chú chuyển khoản', required: false })
  @Allow()
  transfer_note?: string;
} 