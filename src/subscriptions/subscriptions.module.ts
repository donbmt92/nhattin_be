/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsRepo } from './subscriptions.repo';
import { ProductsModule } from '../products/products.module';
import { SubscriptionTypesModule } from '../subscription-types/subscription-types.module';
import { SubscriptionDurationsModule } from '../subscription-durations/subscription-durations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema }
    ]),
    ProductsModule,
    SubscriptionTypesModule,
    SubscriptionDurationsModule
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsRepo],
  exports: [SubscriptionsService]
})
export class SubscriptionsModule {} 