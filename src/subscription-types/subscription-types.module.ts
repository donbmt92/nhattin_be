/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionType, SubscriptionTypeSchema } from './schemas/subscription-type.schema';
import { SubscriptionTypesController } from './subscription-types.controller';
import { SubscriptionTypesService } from './subscription-types.service';
import { SubscriptionTypesRepo } from './subscription-types.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionType.name, schema: SubscriptionTypeSchema }
    ])
  ],
  controllers: [SubscriptionTypesController],
  providers: [SubscriptionTypesService, SubscriptionTypesRepo],
  exports: [SubscriptionTypesService]
})
export class SubscriptionTypesModule {} 