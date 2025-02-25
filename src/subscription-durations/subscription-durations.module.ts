/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDuration, SubscriptionDurationSchema } from './schemas/subscription-duration.schema';
import { SubscriptionDurationsRepo } from './subscription-durations.repo';
import { SubscriptionDurationsController } from './subscription-durations.controller';
import { SubscriptionDurationsService } from './subscription-durations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionDuration.name, schema: SubscriptionDurationSchema }
    ])
  ],
  controllers: [SubscriptionDurationsController],
  providers: [SubscriptionDurationsService, SubscriptionDurationsRepo],
  exports: [SubscriptionDurationsService]
})
export class SubscriptionDurationsModule {} 