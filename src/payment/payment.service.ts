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

    // 🔥 NEW: Luôn tạo order_snapshot khi có id_order
    let orderSnapshot = null;
    if (createPaymentDto.id_order) {
      console.log('🔍 Tìm order với ID:', createPaymentDto.id_order);
      try {
        // Lấy order entity trực tiếp từ database
        const orderEntity = await this.orderModel
          .findById(new Types.ObjectId(createPaymentDto.id_order))
          .lean()
          .exec();
          
        console.log('🔍 Order entity tìm được:', orderEntity ? orderEntity._id : 'null');
          
        if (orderEntity) {
          // Lấy order items
          const orderItems = await this.ordersService.getOrderItems(createPaymentDto.id_order);
          
          orderSnapshot = {
            id: orderEntity._id.toString(),
            total_items: orderEntity.total_items,
            items: orderItems.map(item => ({
              id: item.id,
              quantity: item.quantity,
              final_price: item.final_price,
              product_snapshot: {
                name: item.product_snapshot?.name || 'Sản phẩm',
                image: item.product_snapshot?.image || '',
                description: item.product_snapshot?.description || 'Sản phẩm',
                base_price: item.product_snapshot?.base_price || item.final_price,
                category_id: item.product_snapshot?.category_id || '',
                category_name: item.product_snapshot?.category_name || 'Khác'
              }
            }))
          };
          console.log('✅ Đã tạo order_snapshot từ order thực tế:', orderEntity._id);
        } else {
          // Order không tồn tại, tạo order_snapshot từ thông tin payment
          orderSnapshot = {
            id: createPaymentDto.id_order,
            total_items: 1,
            items: [{
              id: "unknown",
              quantity: 1,
              final_price: createPaymentDto.amount,
              product_snapshot: {
                name: `Sản phẩm từ ${createPaymentDto.provider}`,
                image: '',
                description: `Sản phẩm từ ${createPaymentDto.provider}`,
                base_price: createPaymentDto.amount,
                category_id: '',
                category_name: 'Khác'
              }
            }]
          };
          console.log('⚠️ Đã tạo order_snapshot từ thông tin payment vì order không tồn tại');
        }
      } catch (error) {
        console.warn('❌ Lỗi khi tạo order_snapshot:', error);
        // Fallback: tạo order_snapshot cơ bản
        orderSnapshot = {
          id: createPaymentDto.id_order,
          total_items: 1,
          items: [{
            id: "error",
            quantity: 1,
            final_price: createPaymentDto.amount,
            product_snapshot: {
              name: "Sản phẩm không xác định",
              image: '',
              description: "Sản phẩm không xác định",
              base_price: createPaymentDto.amount,
              category_id: '',
              category_name: 'Khác'
            }
          }]
        };
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
      .exec();
      console.log('payments raw:', payments);
      console.log('payments length:', payments.length);
      
    // Cập nhật order_snapshot cho payments không có
    for (const payment of payments) {
      if (!payment.order_snapshot && payment.id_order) {
        try {
          // Lấy order từ database
          const orderEntity = await this.orderModel
            .findById(payment.id_order)
            .lean()
            .exec();
            
          if (orderEntity) {
            // Lấy order items
            const orderItems = await this.ordersService.getOrderItems(payment.id_order.toString());
            
            const orderSnapshot = {
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
            
            // Cập nhật payment với order_snapshot
            await this.paymentModel.updateOne(
              { _id: payment._id },
              { order_snapshot: orderSnapshot }
            );
            
            payment.order_snapshot = orderSnapshot;
            console.log('✅ Đã cập nhật order_snapshot cho payment:', payment._id);
          } else {
            // Order không tồn tại, tạo order_snapshot từ thông tin có sẵn
            const orderSnapshot = {
              id: payment.id_order.toString(),
              uid: "Unknown",
              status: "completed",
              total_items: 1,
              note: "Order đã bị xóa",
              voucher: "",
              affiliateCode: null,
              commissionAmount: 0,
              commissionStatus: "pending",
              createdAt: (payment as any).createdAt || new Date(),
              updatedAt: (payment as any).updatedAt || new Date(),
              items: [{
                id: "unknown",
                quantity: 1,
                old_price: payment.amount,
                discount_precent: 0,
                final_price: payment.amount,
                product_snapshot: {
                  name: "Sản phẩm từ thanh toán MoMo",
                  image: "",
                  description: "Sản phẩm từ thanh toán MoMo",
                  base_price: payment.amount,
                  category_id: "",
                  category_name: "Khác"
                }
              }]
            };
            
            // Cập nhật payment với order_snapshot
            await this.paymentModel.updateOne(
              { _id: payment._id },
              { order_snapshot: orderSnapshot }
            );
            
            payment.order_snapshot = orderSnapshot;
            console.log('✅ Đã tạo order_snapshot từ thông tin có sẵn cho payment:', payment._id);
          }
        } catch (error) {
          console.warn('❌ Không thể cập nhật order_snapshot cho payment:', payment._id, error);
        }
      }
    }
      
    const result = PaymentDetailModel.fromEntities(payments);
    console.log('result from fromEntities:', result);
    console.log('result length:', result.length);
    
    return result;
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
