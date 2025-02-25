/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsRepo {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>
  ) {}

  async findAll(): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find()
      .populate('user_id')
      .populate('product_id')
      .populate('subscription_type_id')
      .populate('subscription_duration_id')
      .exec();
  }

  async findById(id: string): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findById(id)
      .populate('user_id')
      .populate('product_id')
      .populate('subscription_type_id')
      .populate('subscription_duration_id')
      .exec();
  }

  async findByUserId(userId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ user_id: new Types.ObjectId(userId) })
      .populate('product_id')
      .populate('subscription_type_id')
      .populate('subscription_duration_id')
      .exec();
  }

  async create(data: Partial<Subscription>): Promise<SubscriptionDocument> {
    const newSubscription = new this.subscriptionModel(data);
    return newSubscription.save();
  }

  async update(id: string, data: Partial<Subscription>): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('user_id')
      .populate('product_id')
      .populate('subscription_type_id')
      .populate('subscription_duration_id')
      .exec();
  }

  async delete(id: string): Promise<SubscriptionDocument> {
    return this.subscriptionModel.findByIdAndDelete(id).exec();
  }
} 