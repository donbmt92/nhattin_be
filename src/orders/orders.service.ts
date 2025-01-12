/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderModel } from './model/order.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { CartsService } from '../carts/carts.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
    private readonly cartsService: CartsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async createFromCart(userId: string, createOrderDto: CreateOrderDto): Promise<OrderModel> {
    try {
      // 1. Get user's cart with populated product details
      const cartItems = await this.cartsService.getUserCart(userId);
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      // 2. Create order
      const order = new this.orderModel({
        uid: new Types.ObjectId(userId),
        id_payment: createOrderDto.id_payment ? new Types.ObjectId(createOrderDto.id_payment) : undefined,
        total: 0,
        status: 'pending',
        note: createOrderDto.note,
      });

      const savedOrder = await order.save();
      let totalAmount = 0;

      // 3. Create order items and update inventory
      for (const cartItem of cartItems) {
        // Ensure product details are populated
        const product = cartItem.id_product as any; // Type assertion since we know it's populated
        if (!product || !product._id) {
          throw new BadRequestException('Thông tin sản phẩm không hợp lệ');
        }

        const quantity = cartItem.quantity;

        // Check inventory availability
        await this.inventoryService.checkAndReduceInventory(product._id, quantity);

        // Create order item
        const orderItem = new this.orderItemModel({
          id_order: savedOrder._id,
          id_product: product._id,
          quantity: quantity,
          discount_precent: product.discount?.discount_precent || 0,
          old_price: product.price,
        });

        await orderItem.save();

        // Calculate total
        const itemPrice = product.price * quantity * (1 - (product.discount?.discount_precent || 0) / 100);
        totalAmount += itemPrice;
      }

      // 4. Update order total
      savedOrder.total = totalAmount;
      await savedOrder.save();

      // 5. Clear the cart
      await this.cartsService.clearCart(userId);

      return OrderModel.fromEntity(savedOrder);
    } catch (error) {
      // If any error occurs, rollback the order
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo đơn hàng: ' + error.message);
    }
  }

  async findAll(): Promise<OrderModel[]> {
    const orders = await this.orderModel
      .find()
      .populate('uid')
      .populate('id_payment')
      .exec();
    return OrderModel.fromEntities(orders);
  }

  async findByUser(userId: string): Promise<OrderModel[]> {
    const orders = await this.orderModel
      .find({ uid: new Types.ObjectId(userId) })
      .populate('id_payment')
      .exec();
    return OrderModel.fromEntities(orders);
  }

  async findOne(id: string): Promise<OrderModel> {
    const order = await this.orderModel
      .findById(new Types.ObjectId(id))
      .populate('uid')
      .populate('id_payment')
      .exec();

    if (!order) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }

    return OrderModel.fromEntity(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderModel> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          ...updateOrderDto,
          id_payment: updateOrderDto.id_payment ? new Types.ObjectId(updateOrderDto.id_payment) : undefined,
        },
        { new: true }
      )
      .exec();

    if (!updatedOrder) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }

    return OrderModel.fromEntity(updatedOrder);
  }

  async remove(id: string): Promise<OrderModel> {
    const deletedOrder = await this.orderModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedOrder) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }

    return OrderModel.fromEntity(deletedOrder);
  }
} 