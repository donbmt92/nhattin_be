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

  async createFromCart(userId: string, createOrderDto: CreateOrderDto): Promise<any> {
    try {
      // 1. Get cart items
      const cartItems = await this.cartsService.getUserCart(userId) as any[];
      if (!cartItems || cartItems.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      // 2. Create order
      const order = new this.orderModel({
        uid: userId,
        id_payment: createOrderDto.id_payment,
        voucher: createOrderDto.voucher,
        total: 0,
        status: 'pending',
        note: createOrderDto.note || 'Không có ghi chú',
      });

      const savedOrder = await order.save();
      let totalAmount = 0;
      const orderItems = [];
      console.log(cartItems);
      // 3. Create order items and update inventory
      for (const cartItem of cartItems) {
        // Ensure product details are populated
        const product = cartItem.id_product as any; // Type assertion since we know it's populated
        if (!product || !product._id) {
          throw new BadRequestException('Thông tin sản phẩm không hợp lệ');
        }

        const quantity = cartItem.quantity;

        // Check inventory availability
        // await this.inventoryService.checkAndReduceInventory(product._id, quantity);
        console.log(savedOrder._id, product._id, quantity, product.price, product.discount?.discount_precent);
        
        // Create order item
        const orderItem = new this.orderItemModel({
          id_order: savedOrder._id,
          id_product: product._id,
          quantity: quantity,
          discount_precent: product.discount?.discount_precent || 0,
          old_price: product.price || 0,
        });

        const savedOrderItem = await orderItem.save();

        // Add to orderItems array with product details
        orderItems.push({
          id: savedOrderItem._id,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            images: product.images,
            description: product.description
          },
          quantity: quantity,
          discount_precent: product.discount?.discount_precent || 0,
          old_price: product.price || 0,
          price: product.price * (1 - (product.discount?.discount_precent || 0) / 100),
          subtotal: quantity * product.price * (1 - (product.discount?.discount_precent || 0) / 100)
        });

        // Calculate total
        const productPrice = product.price || 0;
        const discountPercent = product.discount?.discount_precent || 0;
        const itemPrice = productPrice * quantity * (1 - discountPercent / 100);
        
        // Ensure itemPrice is a valid number
        if (!isNaN(itemPrice)) {
          totalAmount += itemPrice;
        } else {
          console.error('Invalid item price calculation:', { productPrice, quantity, discountPercent });
        }
      }

      // 4. Update order total
      // Ensure totalAmount is a valid number
      if (isNaN(totalAmount)) {
        totalAmount = 0;
        console.error('Total amount is NaN, setting to 0');
      }
      
      savedOrder.total = totalAmount;
      await savedOrder.save();

      // 5. Clear cart
      await this.cartsService.clearCart(userId);

      // 6. Return order with items
      const orderModel = OrderModel.fromEntity(savedOrder);
      return {
        ...orderModel,
        items: orderItems
      };
    } catch (error) {
      console.error('Error creating order from cart:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Không thể tạo đơn hàng: ' + error.message);
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

  async getOrderItems(orderId: string): Promise<any[]> {
    try {
      // Find all order items for the given order ID
      const orderItems = await this.orderItemModel.find({ id_order: orderId })
        .populate({
          path: 'id_product',
          select: 'name price images description'
        })
        .exec();
      
      if (!orderItems || orderItems.length === 0) {
        return [];
      }
      
      // Transform the order items to include product details
      return orderItems.map(item => ({
        id: item._id,
        product: item.id_product,
        quantity: item.quantity,
        discount_precent: item.discount_precent,
        old_price: item.old_price,
        price: item.old_price * (1 - item.discount_precent / 100),
        subtotal: item.quantity * item.old_price * (1 - item.discount_precent / 100)
      }));
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw new Error('Không thể lấy danh sách sản phẩm trong đơn hàng');
    }
  }
} 