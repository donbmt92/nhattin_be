/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionTypesRepo } from './subscription-types.repo';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-type.dto';
import { SubscriptionTypeModel } from './models/subscription-type.model';
import { MongooseUtils } from '../common/utils/mongoose.utils';
import { ProductModel } from '../products/models/product.model';

@Injectable()
export class SubscriptionTypesService {
  constructor(private readonly subscriptionTypesRepo: SubscriptionTypesRepo) {}

  async findAll(): Promise<SubscriptionTypeModel[]> {
    const subscriptionTypes = await this.subscriptionTypesRepo.findAll();
    return subscriptionTypes.map(type => SubscriptionTypeModel.fromEntity(type));
  }

  async findById(id: string): Promise<SubscriptionTypeModel> {
    const subscriptionType = await this.subscriptionTypesRepo.findById(id);
    if (!subscriptionType) {
      throw new NotFoundException(`Subscription type with ID ${id} not found`);
    }
    return SubscriptionTypeModel.fromEntity(subscriptionType);
  }

  async findByProductId(productId: string): Promise<SubscriptionTypeModel[]> {
    const subscriptionTypes = await this.subscriptionTypesRepo.findByProductId(productId);
    return subscriptionTypes.map(type => SubscriptionTypeModel.fromEntity(type));
  }

  async create(createSubscriptionTypeDto: CreateSubscriptionTypeDto): Promise<SubscriptionTypeModel> {
    const data = MongooseUtils.convertToObjectIds(createSubscriptionTypeDto);
    
    const newSubscriptionType = await this.subscriptionTypesRepo.create(data);
    return SubscriptionTypeModel.fromEntity(newSubscriptionType);
  }

  async update(id: string, updateSubscriptionTypeDto: Partial<CreateSubscriptionTypeDto>): Promise<SubscriptionTypeModel> {
    const existingSubscriptionType = await this.subscriptionTypesRepo.findById(id);
    if (!existingSubscriptionType) {
      throw new NotFoundException(`Subscription type with ID ${id} not found`);
    }
    
    const updateData = MongooseUtils.convertToObjectIds(updateSubscriptionTypeDto);
    
    const updatedSubscriptionType = await this.subscriptionTypesRepo.update(id, updateData);
    return SubscriptionTypeModel.fromEntity(updatedSubscriptionType);
  }

  async delete(id: string): Promise<void> {
    const existingSubscriptionType = await this.subscriptionTypesRepo.findById(id);
    if (!existingSubscriptionType) {
      throw new NotFoundException(`Subscription type with ID ${id} not found`);
    }
    
    await this.subscriptionTypesRepo.delete(id);
  }

  async findProductById(id: string): Promise<ProductModel> {
    const product = await this.subscriptionTypesRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return ProductModel.fromEntity(product);
  }

  async findByStatus(status: string): Promise<SubscriptionTypeModel[]> {
    const subscriptionTypes = await this.subscriptionTypesRepo.findByStatus(status);
    return subscriptionTypes.map(type => SubscriptionTypeModel.fromEntity(type));
  }
} 