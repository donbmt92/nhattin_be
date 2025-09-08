/* eslint-disable prettier/prettier */
import { IsMongoId, IsNumber, IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enum/order-status.enum';

export class BuyNowDto {
  @ApiProperty({ 
    description: 'ID của sản phẩm muốn mua ngay',
    example: '65f2e0a3a2e0c60c848d3e12'
  })
  @IsMongoId({ message: 'id_product phải là MongoDB ObjectId hợp lệ' })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'id_product phải có định dạng ObjectId (24 ký tự hex)' })
  id_product: string;

  @ApiProperty({ 
    description: 'Số lượng sản phẩm muốn mua',
    minimum: 1,
    example: 2
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({ 
    description: 'ID của payment (tùy chọn)', 
    required: false,
    example: '65f2e0a3a2e0c60c848d3e14'
  })
  @IsMongoId()
  @IsOptional()
  id_payment?: string;

  @ApiProperty({ 
    description: 'Ghi chú đơn hàng',
    example: 'Mua ngay - giao hàng nhanh'
  })
  @IsString()
  note: string;

  @ApiProperty({ 
    description: 'Mã voucher (tùy chọn)',
    required: false,
    example: 'SUMMER2024'
  })
  @IsString()
  @IsOptional()
  voucher?: string;

  @ApiProperty({ 
    description: 'Trạng thái đơn hàng',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    required: false
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.PENDING;

  @ApiProperty({ 
    description: 'Mã affiliate (tùy chọn)',
    required: false,
    example: 'AFFILIATE123'
  })
  @IsString()
  @IsOptional()
  affiliateCode?: string;
}
