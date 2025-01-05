import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { MessengeCode } from '../common/exception/MessengeCode';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}
 
  async addToCart(userId: string, createCartDto: CreateCartDto) {
    const product = await this.productsService.findById(createCartDto.id_product);
    if (!product) {
      throw MessengeCode.PRODUCT.NOT_FOUND;
    }

    const existingItem = await this.cartModel.findOne({
      uid: new Types.ObjectId(userId),
      id_product: new Types.ObjectId(createCartDto.id_product),
    });

    if (existingItem) {
      existingItem.quantity += createCartDto.quantity;
      return await existingItem.save();
    }

    const newCartItem = new this.cartModel({
      uid: new Types.ObjectId(userId),
      id_product: new Types.ObjectId(createCartDto.id_product),
      quantity: createCartDto.quantity,
    });

    return await newCartItem.save();
  }

  async getUserCart(userId: string) {
    return await this.cartModel
      .find({ uid: new Types.ObjectId(userId) })
      .populate('id_product')
      .exec();
  }

  async updateCartItem(userId: string, cartItemId: string, updateCartDto: UpdateCartDto) {
    const cartItem = await this.cartModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(cartItemId),
        uid: new Types.ObjectId(userId),
      },
      { quantity: updateCartDto.quantity },
      { new: true }
    );

    if (!cartItem) {
      throw MessengeCode.CART.ITEM_NOT_FOUND;
    }

    return cartItem;
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const result = await this.cartModel.deleteOne({
      _id: new Types.ObjectId(cartItemId),
      uid: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw MessengeCode.CART.ITEM_NOT_FOUND;
    }

    return { message: 'Item removed from cart' };
  }
  async clearCart(userId: string) {
    return await this.cartModel.deleteMany({ uid: new Types.ObjectId(userId) });
  }
} 