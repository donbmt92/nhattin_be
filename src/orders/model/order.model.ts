/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IOrder } from '../schemas/order.schema';
import { OrderStatus } from '../enum/order-status.enum';

export interface OrderItemModel {
  id: string;
  quantity: number;
  old_price: number;
  discount_precent: number;
  final_price: number;
  product_snapshot?: {
    name: string;
    image: string;
    description: string;
    base_price: number;
    category_id: Types.ObjectId;
    category_name: string;
  };
}

export class OrderModel {
  id: string;
  uid: string;
  id_payment?: string;
  note: string;
  voucher?: string;
  status: OrderStatus;
  total_items: number;
  items: string[];
  created_at: Date;
  updated_at: Date;

  static fromEntity(entity: IOrder): OrderModel {
    if (!entity) {
      throw new BadRequestException('Invalid order entity');
    }

    return {
      id: entity._id.toString(),
      uid: entity.uid.toString(),
      id_payment: entity.id_payment?.toString(),
      note: entity.note,
      voucher: entity.voucher,
      status: entity.status,
      total_items: entity.total_items || 0,
      items: entity.items?.map(id => id.toString()) || [],
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  static fromEntities(entities: IOrder[]): OrderModel[] {
    return entities.map(entity => OrderModel.fromEntity(entity));
  }

  static calculateTotalAmount(items: OrderItemModel[]): number {
    if (!items || items.length === 0) {
      return 0;
    }
 
    return items.reduce((total, item) => {
      const discountPercent = item.discount_precent || 0;
      const itemPrice = item.old_price * (1 - discountPercent / 100);
      return total + (itemPrice * item.quantity);
    }, 0);
  }

  static validateOrder(order: OrderModel): boolean {
    if (!Types.ObjectId.isValid(order.uid)) {
      throw new BadRequestException('Invalid user ID');
    }
    if (order.id_payment && !Types.ObjectId.isValid(order.id_payment)) {
      throw new BadRequestException('Invalid payment ID');
    }
    return true;
  }

  static canUpdateStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.FAILED],
      [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
