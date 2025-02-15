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
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/'
    }),
    ConfigModule.forRoot({ envFilePath: !ENV ? '.env' : `.env.${ENV}` }),
    MongooseModule.forRoot(process.env.MONGOURL, {
      dbName: process.env.DATABASE,
      connectionFactory: (connection) => {
        console.log(`Connected to database: ${process.env.DATABASE}`);
        return connection;
      }
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule {}
