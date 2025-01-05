import { BaseModel } from '../../common/model/base.model';

export class CartModel extends BaseModel {
  id_product: string;
  quantity: number;
  constructor(cart: any) {
    super(cart);
    this.id_product = cart.id_product;
    this.quantity = cart.quantity;
  }
}
