import { BaseModel } from '../../common/model/base.model';

export class CartModel extends BaseModel {
  id_user: string;
  id_product: string;
  quantity: number;
  subscription_type_id?: string;
  subscription_duration_id?: string;
  subscription_type_name?: string;
  subscription_duration?: string;
  subscription_days?: number;
  subscription_price?: number;
  
  constructor(cart: any) {
    super(cart);
    this.id_user = cart.id_user;
    this.id_product = cart.id_product;
    this.quantity = cart.quantity;
    this.subscription_type_id = cart.subscription_type_id;
    this.subscription_duration_id = cart.subscription_duration_id;
    this.subscription_type_name = cart.subscription_type_name;
    this.subscription_duration = cart.subscription_duration;
    this.subscription_days = cart.subscription_days;
    this.subscription_price = cart.subscription_price;
  }
}
