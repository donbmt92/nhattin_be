/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../schemas/product.schema';

export class ProductModel {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: '65abc123def456'
  })
  id: string;

  _id?: any;

  @ApiProperty({
    description: 'ID của danh mục',
    example: '65abc123def456'
  })
  id_category: string;

  @ApiProperty({
    description: 'ID của khuyến mãi',
    example: '65abc123def456',
    required: false
  })
  id_discount?: string;

  @ApiProperty({
    description: 'ID của kho hàng',
    example: '65abc123def456',
    required: false
  })
  id_inventory?: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Tài khoản Netflix Premium'
  })
  name: string;

  @ApiProperty({
    description: 'Slug của sản phẩm (URL-friendly)',
    example: 'tai-khoan-netflix-premium',
    required: false
  })
  slug?: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example: 'Tài khoản Netflix Premium chất lượng cao, xem phim không giới hạn'
  })
  description: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh gốc sản phẩm',
    example: 'uploads/products/netflix-premium.jpg'
  })
  image: string;

  @ApiProperty({
    description: 'Đường dẫn hình ảnh thumbnail sản phẩm',
    example: 'uploads/products/thumb_netflix-premium.jpg',
    required: false
  })
  thumbnail?: string;

  @ApiProperty({
    description: 'Giá gốc sản phẩm (VND)',
    example: 299000
  })
  base_price: number;

  @ApiProperty({
    description: 'Giá thấp nhất (VND)',
    example: 10000
  })
  min_price: number;

  @ApiProperty({
    description: 'Giá cao nhất (VND)',
    example: 849000
  })
  max_price: number;

  @ApiProperty({
    description: 'Điểm đánh giá trung bình',
    example: 5.0
  })
  rating: number;

  @ApiProperty({
    description: 'Số lượng đánh giá',
    example: 173
  })
  total_reviews: number;

  @ApiProperty({
    description: 'Số lượng đã bán',
    example: 27268
  })
  sold: number;

  @ApiProperty({
    description: 'Chính sách bảo hành',
    example: true
  })
  warranty_policy: boolean;

  @ApiProperty({
    description: 'Tình trạng sản phẩm',
    enum: ProductStatus,
    example: ProductStatus.IN_STOCK
  })
  status: ProductStatus;

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

  constructor(partial: Partial<ProductModel>) {
    Object.assign(this, partial);
    if (partial._id) {
      this.id = partial._id.toString();
    }
  }

  static fromEntity(entity: any): ProductModel {
    if (!entity) return null;

    const model = new ProductModel({
      _id: entity._id,
      id_category: entity.id_category,
      id_discount: entity.id_discount,
      id_inventory: entity.id_inventory,
      name: entity.name,
      description: entity.description,
      image: entity.image,
      thumbnail: entity.thumbnail,
      base_price: entity.base_price,
      min_price: entity.min_price,
      max_price: entity.max_price,
      rating: entity.rating,
      total_reviews: entity.total_reviews,
      sold: entity.sold,
      warranty_policy: entity.warranty_policy,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });

    return model;
  }
} 