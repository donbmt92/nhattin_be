import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderItem, OrderItemSchema } from './schemas/order-item.schema';
import { CartsModule } from '../carts/carts.module';
import { ProductSchema } from '../products/schemas/product.schema';
import { CategorySchema } from '../categories/schemas/category.schema';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Category', schema: CategorySchema }
    ]),
    CartsModule,
    AffiliateModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
