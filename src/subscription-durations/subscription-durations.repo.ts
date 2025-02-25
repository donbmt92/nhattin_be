/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionDuration, SubscriptionDurationDocument } from './schemas/subscription-duration.schema';
import { CreateSubscriptionDurationDto } from './dto/create-subscription-duration.dto';

@Injectable()
export class SubscriptionDurationsRepo {
  constructor(
    @InjectModel(SubscriptionDuration.name) private subscriptionDurationModel: Model<SubscriptionDurationDocument>
  ) {}

  async findAll(): Promise<SubscriptionDurationDocument[]> {
    return this.subscriptionDurationModel.find().exec();
  }

  async findById(id: string): Promise<SubscriptionDurationDocument> {
    return this.subscriptionDurationModel.findById(id).exec();
  }

  async findByProductId(productId: string): Promise<SubscriptionDurationDocument[]> {
    return this.subscriptionDurationModel.find({ product_id: productId }).exec();
  }

  async create(createSubscriptionDurationDto: CreateSubscriptionDurationDto): Promise<SubscriptionDurationDocument> {
    const newSubscriptionDuration = new this.subscriptionDurationModel(createSubscriptionDurationDto);
    return newSubscriptionDuration.save();
  }

  async update(id: string, updateSubscriptionDurationDto: Partial<SubscriptionDuration>): Promise<SubscriptionDurationDocument> {
    return this.subscriptionDurationModel.findByIdAndUpdate(id, updateSubscriptionDurationDto, { new: true }).exec();
  }

  async delete(id: string): Promise<SubscriptionDurationDocument> {
    return this.subscriptionDurationModel.findByIdAndDelete(id).exec();
  }
} 