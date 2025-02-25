/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionDocument } from '../schemas/subscription.schema';

export class SubscriptionModel {
  @ApiProperty({ description: 'ID của đăng ký' })
  id: string;

  @ApiProperty({ description: 'ID của người dùng' })
  user_id: string;

  @ApiProperty({ description: 'ID của sản phẩm' })
  product_id: string;

  @ApiProperty({ description: 'ID của loại gói đăng ký' })
  subscription_type_id: string;

  @ApiProperty({ description: 'ID của thời hạn gói đăng ký' })
  subscription_duration_id: string;

  @ApiProperty({ description: 'Ngày bắt đầu gói đăng ký' })
  start_date: Date;

  @ApiProperty({ description: 'Ngày kết thúc gói đăng ký' })
  end_date: Date;

  @ApiProperty({ description: 'Trạng thái gói đăng ký', enum: ['active', 'expired', 'cancelled'] })
  status: string;

  @ApiProperty({ description: 'Ghi chú cho đăng ký', required: false })
  notes?: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  constructor(partial: Partial<SubscriptionModel>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: SubscriptionDocument): SubscriptionModel {
    return new SubscriptionModel({
      id: entity._id?.toString(),
      user_id: entity.user_id?.toString(),
      product_id: entity.product_id?.toString(),
      subscription_type_id: entity.subscription_type_id?.toString(),
      subscription_duration_id: entity.subscription_duration_id?.toString(),
      start_date: entity.start_date,
      end_date: entity.end_date,
      status: entity.status,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  static fromEntities(entities: SubscriptionDocument[]): SubscriptionModel[] {
    return entities.map(entity => this.fromEntity(entity));
  }
} 