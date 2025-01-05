import { BaseModel } from '../../common/model/base.model';
import { DiscountDocument } from '../schemas/discount.schema';

export class DiscountModel extends BaseModel {
  name: string;
  desc: string;
  discount_percent: number;
  time_start: Date;
  time_end: Date;
  status: string;
  constructor(discount: any) {
    super(discount);
    this.name = discount.name;
    this.desc = discount.desc;
    this.discount_percent = discount.discount_percent;
    this.time_start = discount.time_start;
    this.time_end = discount.time_end;
    this.status = discount.status;
  }

  static fromEntity(discount: DiscountDocument): DiscountModel {
    return new DiscountModel(discount);
  }

  static fromEntities(discounts: DiscountDocument[]): DiscountModel[] {
    return discounts.map(discount => DiscountModel.fromEntity(discount));
  }
}
