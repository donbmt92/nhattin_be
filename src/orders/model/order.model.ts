import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';
import { OrderStatus } from '../enum/order-status.enum';

export class OrderModel extends BaseModel {
  uid: Types.ObjectId;
  id_payment?: Types.ObjectId;
  note: string;
  total: number;
  voucher?: string;
  status: OrderStatus;

  constructor(order: any) {
    super(order);
    this.uid = order.uid;
    this.id_payment = order.id_payment;
    this.note = order.note;
    this.total = order.total;
    this.voucher = order.voucher;
    this.status = order.status;
  }

  static fromEntity(entity: any): OrderModel {
    return new OrderModel({
      id: entity._id,
      uid: entity.uid,
      id_payment: entity.id_payment,
      note: entity.note,
      total: entity.total,
      voucher: entity.voucher,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): OrderModel[] {
    return entities.map(entity => OrderModel.fromEntity(entity));
  }
}
