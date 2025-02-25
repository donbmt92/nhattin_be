/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionTypeStatus } from '../schemas/subscription-type.schema';

export class SubscriptionTypeModel {
  @ApiProperty({
    description: 'ID của loại gói đăng ký',
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
    description: 'Tên gói đăng ký',
    example: 'Premium'
  })
  type_name: string;

  @ApiProperty({
    description: 'Trạng thái gói đăng ký',
    enum: SubscriptionTypeStatus,
    example: SubscriptionTypeStatus.ACTIVE
  })
  status: SubscriptionTypeStatus;

  @ApiProperty({
    description: 'Tên loại gói đăng ký',
    example: 'Gói cơ bản'
  })
  name: string;

  @ApiProperty({
    description: 'Mô tả loại gói đăng ký',
    example: 'Gói dịch vụ cơ bản với các tính năng thiết yếu'
  })
  description: string;

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

  constructor(partial: Partial<SubscriptionTypeModel>) {
    Object.assign(this, partial);
    if (partial._id) {
      this.id = partial._id.toString();
    }
  }

  static fromEntity(entity: any): SubscriptionTypeModel {
    if (!entity) return null;

    const model = new SubscriptionTypeModel({
      _id: entity._id,
      product_id: entity.product_id,
      type_name: entity.type_name,
      status: entity.status,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });

    return model;
  }
} 