/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDurationModel {
  @ApiProperty({
    description: 'ID của thời hạn gói đăng ký',
    example: '65abc123def456'
  })
  id: string;

  _id?: any; // Thêm thuộc tính _id để tránh lỗi

  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '65abc123def456'
  })
  product_id: string;

  @ApiProperty({
    description: 'ID của loại gói đăng ký',
    example: '65abc123def456'
  })
  subscription_type_id: string;

  @ApiProperty({
    description: 'Thời gian sử dụng',
    example: '1 tháng'
  })
  duration: string;

  @ApiProperty({
    description: 'Giá tương ứng với thời hạn (VND)',
    example: 149000
  })
  price: number;

  @ApiProperty({
    description: 'Số ngày của thời hạn',
    example: 30
  })
  days: number;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-03-20T03:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2024-03-20T03:00:00.000Z'
  })
  updatedAt: Date;

  constructor(partial: Partial<SubscriptionDurationModel>) {
    Object.assign(this, partial);
    if (partial._id) {
      this.id = partial._id.toString();
    }
  }

  static fromEntity(entity: any): SubscriptionDurationModel {
    if (!entity) return null;

    const model = new SubscriptionDurationModel({
      _id: entity._id,
      product_id: entity.product_id,
      subscription_type_id: entity.subscription_type_id,
      duration: entity.duration,
      price: entity.price,
      days: entity.days,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });

    return model;
  }
} 