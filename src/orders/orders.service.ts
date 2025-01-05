import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderModel } from './model/order.model';
import { MessengeCode } from '../common/exception/MessengeCode';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<OrderModel> {
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      uid: new Types.ObjectId(userId),
      id_payment: createOrderDto.id_payment ? new Types.ObjectId(createOrderDto.id_payment) : undefined,
    });

    const savedOrder = await createdOrder.save();
    return OrderModel.fromEntity(savedOrder);
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