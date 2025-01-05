import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentDetail, PaymentDetailDocument } from './schemas/payment-detail.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentDetailModel } from './model/payment.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentDetail.name) private paymentModel: Model<PaymentDetailDocument>,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentDetailModel> {
    // Kiểm tra order tồn tại
    await this.ordersService.findOne(createPaymentDto.id_order);

    const createdPayment = new this.paymentModel({
      ...createPaymentDto,
      id_order: new Types.ObjectId(createPaymentDto.id_order),
    });

    const savedPayment = await createdPayment.save();
    return PaymentDetailModel.fromEntity(savedPayment);
  }

  async findAll(): Promise<PaymentDetailModel[]> {
    const payments = await this.paymentModel
      .find()
      .populate('id_order')
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

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentDetailModel> {
    if (updatePaymentDto.id_order) {
      await this.ordersService.findOne(updatePaymentDto.id_order);
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          ...updatePaymentDto,
          id_order: updatePaymentDto.id_order 
            ? new Types.ObjectId(updatePaymentDto.id_order)
            : undefined,
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