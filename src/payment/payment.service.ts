import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaymentDetail,
  PaymentDetailDocument
} from './schemas/payment-detail.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentDetailModel } from './model/payment.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentDetail.name)
    private paymentModel: Model<PaymentDetailDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private readonly ordersService: OrdersService
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto
  ): Promise<PaymentDetailModel> {
    console.log('createPaymentDto', createPaymentDto);

    const paymentData = { ...createPaymentDto };

    // Convert transfer_date from string to Date if provided
    if (paymentData.transfer_date) {
      paymentData.transfer_date = new Date(paymentData.transfer_date) as any;
    }

    // 🔥 NEW: Populate order data nếu có id_order
    let orderSnapshot = null;
    if (createPaymentDto.id_order) {
      try {
        // Lấy order entity trực tiếp từ database
        const orderEntity = await this.orderModel
          .findById(new Types.ObjectId(createPaymentDto.id_order))
          .lean()
          .exec();
          
        if (orderEntity) {
          // Lấy order items
          const orderItems = await this.ordersService.getOrderItems(createPaymentDto.id_order);
          
          orderSnapshot = {
            id: orderEntity._id.toString(),
            uid: orderEntity.uid.toString(),
            status: orderEntity.status,
            total_items: orderEntity.total_items,
            note: orderEntity.note,
            voucher: orderEntity.voucher,
            affiliateCode: orderEntity.affiliateCode,
            commissionAmount: orderEntity.commissionAmount,
            commissionStatus: orderEntity.commissionStatus,
            createdAt: orderEntity.createdAt,
            updatedAt: orderEntity.updatedAt,
            items: orderItems.map(item => ({
              id: item.id,
              quantity: item.quantity,
              old_price: item.old_price,
              discount_precent: item.discount_precent,
              final_price: item.final_price,
              product_snapshot: item.product_snapshot
            }))
          };
        }
      } catch (error) {
        console.warn('Không thể lấy thông tin order:', error);
      }
    }

    const createdPayment = new this.paymentModel({
      ...paymentData,
      id_order: createPaymentDto.id_order ? new Types.ObjectId(createPaymentDto.id_order) : null,
      order_snapshot: orderSnapshot
    });
    console.log('createdPayment', createdPayment);
    const savedPayment = await createdPayment.save();
    return PaymentDetailModel.fromEntity(savedPayment);
  }

  async findAll(): Promise<PaymentDetailModel[]> {
    // Chỉ lấy những payment đã thanh toán thành công
    const payments = await this.paymentModel
      .find({ status: 'completed' })
      .populate({
        path: 'id_order',
        model: 'Order',
        select: 'id status total_items note createdAt'
      })
      .exec();
      console.log('payments', payments);
      
    return PaymentDetailModel.fromEntities(payments);
  }

  async findAllForAdmin(): Promise<PaymentDetailModel[]> {
    // Admin có thể xem tất cả payment (bao gồm cả chưa thanh toán)
    const payments = await this.paymentModel
      .find()
      .populate({
        path: 'id_order',
        model: 'Order',
        select: 'id status total_items note createdAt'
      })
      .exec();
    return PaymentDetailModel.fromEntities(payments);
  }

  async findOne(id: string): Promise<PaymentDetailModel> {
    const payment = await this.paymentModel
      .findById(new Types.ObjectId(id))
      .populate('id_order')
      .exec();

    if (!payment) {
      throw MessengeCode.PAYMENT.NOT_FOUND;
    }

    return PaymentDetailModel.fromEntity(payment);
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto
  ): Promise<PaymentDetailModel> {
    if (updatePaymentDto.id_order) {
      await this.ordersService.findOne(updatePaymentDto.id_order);
    }

    const updateData = { ...updatePaymentDto };

    // Convert transfer_date from string to Date if provided
    if (updateData.transfer_date) {
      updateData.transfer_date = new Date(updateData.transfer_date) as any;
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          ...updateData,
          id_order: updatePaymentDto.id_order
            ? new Types.ObjectId(updatePaymentDto.id_order)
            : undefined
        },
        { new: true }
      )
      .exec();

    if (!updatedPayment) {
      throw MessengeCode.PAYMENT.NOT_FOUND;
    }

    return PaymentDetailModel.fromEntity(updatedPayment);
  }

  async remove(id: string): Promise<PaymentDetailModel> {
    const deletedPayment = await this.paymentModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedPayment) {
      throw MessengeCode.PAYMENT.NOT_FOUND;
    }

    return PaymentDetailModel.fromEntity(deletedPayment);
  }
}
