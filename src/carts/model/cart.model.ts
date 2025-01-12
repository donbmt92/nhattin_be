import { BaseModel } from '../../common/model/base.model';

export class CartModel extends BaseModel {
  id_user: string;
  id_product: string;
  quantity: number;
  constructor(cart: any) {
    super(cart);
    this.id_user = cart.id_user;
    this.id_product = cart.id_product;
    this.quantity = cart.quantity;
  }
}
