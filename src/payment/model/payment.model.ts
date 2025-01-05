import { BaseModel } from '../../common/model/base.model';
import { Types } from 'mongoose';

export class PaymentDetailModel extends BaseModel {
  id_order: Types.ObjectId;
  provider: string;
  status: string;

  constructor(paymentDetail: any) {
    super(paymentDetail);
    this.id_order = paymentDetail.id_order;
    this.provider = paymentDetail.provider;
    this.status = paymentDetail.status;
  }

  static fromEntity(entity: any): PaymentDetailModel {
    return new PaymentDetailModel({
      id: entity._id,
      id_order: entity.id_order,
      provider: entity.provider,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: any[]): PaymentDetailModel[] {
    return entities.map(entity => PaymentDetailModel.fromEntity(entity));
  }
}
