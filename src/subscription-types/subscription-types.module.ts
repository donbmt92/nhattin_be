/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionType, SubscriptionTypeSchema } from './schemas/subscription-type.schema';
import { SubscriptionTypesController } from './subscription-types.controller';
import { SubscriptionTypesService } from './subscription-types.service';
import { SubscriptionTypesRepo } from './subscription-types.repo';
import { SubscriptionDurationsModule } from '../subscription-durations/subscription-durations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionType.name, schema: SubscriptionTypeSchema }
    ]),
    forwardRef(() => SubscriptionDurationsModule)
  ],
  controllers: [SubscriptionTypesController],
  providers: [SubscriptionTypesService, SubscriptionTypesRepo],
  exports: [SubscriptionTypesService]
})
export class SubscriptionTypesModule {} 