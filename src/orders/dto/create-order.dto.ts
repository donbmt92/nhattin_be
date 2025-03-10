/* eslint-disable prettier/prettier */
import { IsMongoId, IsNumber, IsString, IsOptional, Min, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enum/order-status.enum';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID của payment' })
  @IsMongoId()
  @IsOptional()
  id_payment?: string;

  @ApiProperty({ description: 'Ghi chú đơn hàng' })
  @IsString()
  note: string;

  @ApiProperty({ description: 'Tổng tiền', minimum: 0 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ description: 'Mã voucher' })
  @IsString()
  @IsOptional()
  voucher?: string;

  @ApiProperty({ description: 'Trạng thái đơn hàng', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  // @ApiProperty({ description: 'Danh sách sản phẩm trong đơn hàng' })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => OrderItemDto)
  // items: OrderItemDto[];
} 