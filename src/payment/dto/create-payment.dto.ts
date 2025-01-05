import { IsString, IsMongoId, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../enum/payment-status.enum';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID của đơn hàng' })
  @IsMongoId()
  @IsNotEmpty()
  id_order: string;

  @ApiProperty({ description: 'Nhà cung cấp thanh toán' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ description: 'Trạng thái thanh toán', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
} 