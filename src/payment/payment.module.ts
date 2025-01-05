import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentDetail,
  PaymentDetailSchema,
} from './schemas/payment-detail.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentDetail.name, schema: PaymentDetailSchema },
    ]),
    OrdersModule,
    UsersModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}
