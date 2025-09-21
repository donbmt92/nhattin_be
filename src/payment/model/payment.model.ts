import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';

export class PaymentDetailModel extends BaseModel {
  id_order: Types.ObjectId;
  provider: string;
  status: string;
  amount: number;
  is_bank_transfer: boolean;
  bank_name?: string;
  transaction_reference?: string;
  transfer_date?: Date;
  transfer_note?: string;
  order_snapshot?: any; // Order snapshot data

  constructor(paymentDetail: any) {
    super({
      id: paymentDetail.id,
      createdAt: paymentDetail.createdAt,
      updatedAt: paymentDetail.updatedAt
    });
    this.id_order = paymentDetail.id_order;
    this.provider = paymentDetail.provider;
    this.status = paymentDetail.status;
    this.amount = paymentDetail.amount;
    this.is_bank_transfer = paymentDetail.is_bank_transfer || false;
    this.bank_name = paymentDetail.bank_name;
    this.transaction_reference = paymentDetail.transaction_reference;
    this.transfer_date = paymentDetail.transfer_date;
    this.transfer_note = paymentDetail.transfer_note;
    this.order_snapshot = paymentDetail.order_snapshot;
  }

  static fromEntity(entity: any): PaymentDetailModel {
    return new PaymentDetailModel({
      id: entity._id,
      id_order: entity.id_order,
      provider: entity.provider,
      status: entity.status,
      amount: entity.amount,
      is_bank_transfer: entity.is_bank_transfer,
      bank_name: entity.bank_name,
      transaction_reference: entity.transaction_reference,
      transfer_date: entity.transfer_date,
      transfer_note: entity.transfer_note,
      order_snapshot: entity.order_snapshot,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    });
  }

  static fromEntities(entities: any[]): PaymentDetailModel[] {
    return entities.map((entity) => PaymentDetailModel.fromEntity(entity));
  }
}
