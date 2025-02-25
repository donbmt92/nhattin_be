/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionType, SubscriptionTypeDocument } from './schemas/subscription-type.schema';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-type.dto';

@Injectable()
export class SubscriptionTypesRepo {
  constructor(
    @InjectModel(SubscriptionType.name) private subscriptionTypeModel: Model<SubscriptionTypeDocument>
  ) {}

  async findAll(): Promise<SubscriptionTypeDocument[]> {
    return this.subscriptionTypeModel.find().exec();
  }

  async findById(id: string): Promise<SubscriptionTypeDocument> {
    return this.subscriptionTypeModel.findById(id).exec();
  }

  async findByProductId(productId: string): Promise<SubscriptionTypeDocument[]> {
    return this.subscriptionTypeModel.find({ product_id: productId }).exec();
  }

  async create(createSubscriptionTypeDto: CreateSubscriptionTypeDto): Promise<SubscriptionTypeDocument> {
    const newSubscriptionType = new this.subscriptionTypeModel(createSubscriptionTypeDto);
    return newSubscriptionType.save();
  }

  async update(id: string, updateSubscriptionTypeDto: Partial<SubscriptionType>): Promise<SubscriptionTypeDocument> {
    return this.subscriptionTypeModel.findByIdAndUpdate(id, updateSubscriptionTypeDto, { new: true }).exec();
  }

  async delete(id: string): Promise<SubscriptionTypeDocument> {
    return this.subscriptionTypeModel.findByIdAndDelete(id).exec();
  }
} 