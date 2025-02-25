/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionDurationsRepo } from './subscription-durations.repo';
import { CreateSubscriptionDurationDto } from './dto/create-subscription-duration.dto';
import { SubscriptionDurationModel } from './models/subscription-duration.model';
import { MongooseUtils } from '../common/utils/mongoose.utils';

@Injectable()
export class SubscriptionDurationsService {
  constructor(private readonly subscriptionDurationsRepo: SubscriptionDurationsRepo) {}

  async findAll(): Promise<SubscriptionDurationModel[]> {
    const subscriptionDurations = await this.subscriptionDurationsRepo.findAll();
    return subscriptionDurations.map(duration => SubscriptionDurationModel.fromEntity(duration));
  }

  async findById(id: string): Promise<SubscriptionDurationModel> {
    const subscriptionDuration = await this.subscriptionDurationsRepo.findById(id);
    if (!subscriptionDuration) {
      throw new NotFoundException(`Subscription duration with ID ${id} not found`);
    }
    return SubscriptionDurationModel.fromEntity(subscriptionDuration);
  }

  async findByProductId(productId: string): Promise<SubscriptionDurationModel[]> {
    const subscriptionDurations = await this.subscriptionDurationsRepo.findByProductId(productId);
    return subscriptionDurations.map(duration => SubscriptionDurationModel.fromEntity(duration));
  }

  async create(createSubscriptionDurationDto: CreateSubscriptionDurationDto): Promise<SubscriptionDurationModel> {
    // Chuyển đổi string ID sang ObjectId
    const data = MongooseUtils.convertToObjectIds(createSubscriptionDurationDto);
    
    const newSubscriptionDuration = await this.subscriptionDurationsRepo.create(data);
    return SubscriptionDurationModel.fromEntity(newSubscriptionDuration);
  }

  async update(id: string, updateSubscriptionDurationDto: Partial<CreateSubscriptionDurationDto>): Promise<SubscriptionDurationModel> {
    const existingSubscriptionDuration = await this.subscriptionDurationsRepo.findById(id);
    if (!existingSubscriptionDuration) {
      throw new NotFoundException(`Subscription duration with ID ${id} not found`);
    }
    
    // Chuyển đổi string ID sang ObjectId
    const updateData = MongooseUtils.convertToObjectIds(updateSubscriptionDurationDto);
    
    const updatedSubscriptionDuration = await this.subscriptionDurationsRepo.update(id, updateData);
    return SubscriptionDurationModel.fromEntity(updatedSubscriptionDuration);
  }

  async delete(id: string): Promise<void> {
    const existingSubscriptionDuration = await this.subscriptionDurationsRepo.findById(id);
    if (!existingSubscriptionDuration) {
      throw new NotFoundException(`Subscription duration with ID ${id} not found`);
    }
    
    await this.subscriptionDurationsRepo.delete(id);
  }
} 