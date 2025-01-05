import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DiscountModule } from './discount/discount.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';
import { CategoryModule } from './category/category.module';
import { ImageModule } from './image/image.module';
import { NavigationModule } from './navigation/navigation.module';
import { PagesModule } from './pages/pages.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: !ENV ? '.env' : `.env.${ENV}` }),
    MongooseModule.forRoot(process.env.MONGOURL, {
      dbName: process.env.DATABASE,
    }),
    AuthModule,
    UsersModule,
    DiscountModule,
    ProductsModule,
    WarehousesModule,
    CartsModule,
    OrdersModule,
    PaymentModule,
    InventoryModule,
    InventoryLogsModule,
    CategoryModule,
    ImageModule,
    NavigationModule,
    PagesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
