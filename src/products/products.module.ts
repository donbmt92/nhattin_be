import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CategoryModule } from '../category/category.module';
import { ImageModule } from '../image/image.module';
import { UsersModule } from '../users/users.module';
import { SubscriptionTypesModule } from '../subscription-types/subscription-types.module';
import { SubscriptionDurationsModule } from '../subscription-durations/subscription-durations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoryModule,
    ImageModule,
    UsersModule,
    SubscriptionTypesModule,
    SubscriptionDurationsModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
