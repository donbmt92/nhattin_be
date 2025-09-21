/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    const query = { product_id: new Types.ObjectId(productId) };
    console.log('Executing Query:', query);
    const results = await this.subscriptionDurationModel.find(query).exec();
    console.log('Query Results:', results);
    return results;
  }

  async findBySubscriptionTypeId(subscriptionTypeId: string): Promise<SubscriptionDurationDocument[]> {
    const query = { subscription_type_id: subscriptionTypeId };
    console.log('Executing Query by subscription_type_id:', JSON.stringify(query));
    console.log('Looking for subscription_type_id:', subscriptionTypeId);
    const results = await this.subscriptionDurationModel.find(query).exec();
    console.log('Query Results by subscription_type_id:', JSON.stringify(results, null, 2));
    console.log('Number of results found:', results.length);
    return results;
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