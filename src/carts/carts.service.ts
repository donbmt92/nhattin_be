/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async addToCart(userId: string, createCartDto: CreateCartDto) {
    try {
      // Validate ObjectIds
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('ID người dùng không hợp lệ');
      }
      if (!isValidObjectId(createCartDto.id_product)) {
        throw new BadRequestException('ID sản phẩm không hợp lệ');
      }

      // Validate quantity
      if (createCartDto.quantity <= 0) {
        throw new BadRequestException('Số lượng phải lớn hơn 0');
      }

      // Check if product exists
      const product = await this.productsService.findById(createCartDto.id_product);
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Check if item already exists in cart
      const existingItem = await this.cartModel.findOne({
        uid: new Types.ObjectId(userId),
        id_product: new Types.ObjectId(createCartDto.id_product),
      });

      if (existingItem) {
        // Update quantity of existing item
        existingItem.quantity += createCartDto.quantity;
        
        // Validate updated quantity
        if (existingItem.quantity <= 0) {
          await this.cartModel.deleteOne({ _id: existingItem._id });
          return { message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
        }

        return await existingItem.save();
      }

      // Create new cart item
      const newCartItem = new this.cartModel({
        uid: new Types.ObjectId(userId),
        id_product: new Types.ObjectId(createCartDto.id_product),
        quantity: createCartDto.quantity,
      });

      return await newCartItem.save();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể thêm vào giỏ hàng: ' + error.message);
    }
  }

  async getUserCart(userId: string) {
    try {
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('ID người dùng không hợp lệ');
      }

      const cartItems = await this.cartModel
        .find({ uid: new Types.ObjectId(userId) })
        .populate('id_product')
        .exec();

      if (!cartItems || cartItems.length === 0) {
        return { message: 'Giỏ hàng trống' };
      }

      return cartItems;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy giỏ hàng: ' + error.message);
    }
  }

  async updateCartItem(userId: string, cartItemId: string, updateCartDto: UpdateCartDto) {
    try {
      // Validate ObjectIds
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('ID người dùng không hợp lệ');
      }
      if (!isValidObjectId(cartItemId)) {
        throw new BadRequestException('ID giỏ hàng không hợp lệ');
      }

      // Validate quantity
      if (updateCartDto.quantity <= 0) {
        // If quantity is 0 or negative, remove item from cart
        await this.removeFromCart(userId, cartItemId);
        return { message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
      }

      // Update cart item
      const cartItem = await this.cartModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(cartItemId),
          uid: new Types.ObjectId(userId),
        },
        { quantity: updateCartDto.quantity },
        { new: true },
      );

      if (!cartItem) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      return cartItem;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật giỏ hàng: ' + error.message);
    }
  }

  async removeFromCart(userId: string, cartItemId: string) {
    try {
      // Validate ObjectIds
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('ID người dùng không hợp lệ');
      }
      if (!isValidObjectId(cartItemId)) {
        throw new BadRequestException('ID giỏ hàng không hợp lệ');
      }

      const result = await this.cartModel.deleteOne({
        _id: new Types.ObjectId(cartItemId),
        uid: new Types.ObjectId(userId),
      });

      if (result.deletedCount === 0) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      return { message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa sản phẩm khỏi giỏ hàng: ' + error.message);
    }
  }

  async clearCart(userId: string) {
    try {
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('ID người dùng không hợp lệ');
      }

      const result = await this.cartModel.deleteMany({ 
        uid: new Types.ObjectId(userId) 
      });

      if (result.deletedCount === 0) {
        return { message: 'Giỏ hàng đã trống' };
      }

      return { message: 'Đã xóa tất cả sản phẩm khỏi giỏ hàng' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể xóa giỏ hàng: ' + error.message);
    }
  }
}
