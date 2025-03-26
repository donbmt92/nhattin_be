/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { CategoryStatus } from '../schemas/category.schema';

export class CategoryModel {
  @ApiProperty({
    description: 'ID của danh mục',
    example: '65abc123def456'
  })
  id: string;

  _id?: any; // Thêm thuộc tính _id để tránh lỗi

  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Tài khoản Netflix'
  })
  name: string;

  @ApiProperty({
    description: 'Trạng thái danh mục',
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE
  })
  status: CategoryStatus;

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

  @ApiProperty({
    description: 'URL hình ảnh danh mục',
    example: 'https://res.cloudinary.com/example/image/upload/v1234567/categories/category1.jpg'
  })
  image?: string;

  constructor(partial: Partial<CategoryModel>) {
    Object.assign(this, partial);
    if (partial._id) {
      this.id = partial._id.toString();
    }
  }

  static fromEntity(entity: any): CategoryModel {
    if (!entity) return null;

    const model = new CategoryModel({
      _id: entity._id,
      name: entity.name,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      image: entity.image
    });

    return model;
  }
} 