/* eslint-disable prettier/prettier */
import { IsMongoId, IsNumber, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enum/order-status.enum';

export class OrderItemDto {
  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsMongoId()
  id_product: string;

  @ApiProperty({ description: 'Số lượng' })
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID của payment', required: false })
  @IsMongoId()
  @IsOptional()
  id_payment?: string;

  @ApiProperty({ description: 'Ghi chú đơn hàng' })
  @IsString()
  note: string;

  @ApiProperty({ description: 'Mã voucher', required: false })
  @IsString()
  @IsOptional()
  voucher?: string;

  @ApiProperty({ description: 'Trạng thái đơn hàng', enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.PENDING;

  @ApiProperty({ description: 'Danh sách sản phẩm trong đơn hàng', type: [OrderItemDto] })
  @IsArray()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
} 