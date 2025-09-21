/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { SubscriptionTypesRepo } from './subscription-types.repo';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-type.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-type.dto';
import { SubscriptionTypeModel } from './models/subscription-type.model';
import { MongooseUtils } from '../common/utils/mongoose.utils';
import { ProductModel } from '../products/models/product.model';
import { SubscriptionDurationsService } from '../subscription-durations/subscription-durations.service';

@Injectable()
export class SubscriptionTypesService {
  constructor(
    private readonly subscriptionTypesRepo: SubscriptionTypesRepo,
    @Inject(forwardRef(() => SubscriptionDurationsService))
    private readonly subscriptionDurationsService: SubscriptionDurationsService
  ) {}

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

  async findByProductIdWithDurations(productId: string): Promise<any[]> {
    const subscriptionTypes = await this.subscriptionTypesRepo.findByProductId(productId);
    console.log('Found subscription types:', subscriptionTypes.length);
    
    // Lấy durations cho từng subscription type
    const subscriptionTypesWithDurations = await Promise.all(
      subscriptionTypes.map(async (type) => {
        console.log(`Getting durations for subscription type: ${type._id.toString()}`);
        const durations = await this.subscriptionDurationsService.findBySubscriptionTypeId(type._id.toString());
        console.log(`Found ${durations.length} durations for type ${type._id.toString()}`);
        console.log('Durations data:', JSON.stringify(durations, null, 2));
        
        const subscriptionTypeModel = SubscriptionTypeModel.fromEntity(type);
        
        // Serialize durations properly
        const serializedDurations = durations.map(duration => ({
          id: duration.id,
          _id: duration._id,
          product_id: duration.product_id,
          subscription_type_id: duration.subscription_type_id,
          duration: duration.duration,
          price: duration.price,
          days: duration.days,
          createdAt: duration.createdAt,
          updatedAt: duration.updatedAt
        }));
        
        const result = {
          id: subscriptionTypeModel.id,
          _id: subscriptionTypeModel._id,
          product_id: subscriptionTypeModel.product_id,
          type_name: subscriptionTypeModel.type_name,
          status: subscriptionTypeModel.status,
          name: subscriptionTypeModel.name,
          description: subscriptionTypeModel.description,
          createdAt: subscriptionTypeModel.createdAt,
          updatedAt: subscriptionTypeModel.updatedAt,
          durations: serializedDurations
        };
        return result;
      })
    );
    
    console.log('Final result with durations:', JSON.stringify(subscriptionTypesWithDurations, null, 2));
    return subscriptionTypesWithDurations;
  }

  async create(createSubscriptionTypeDto: CreateSubscriptionTypeDto): Promise<SubscriptionTypeModel> {
    const data = MongooseUtils.convertToObjectIds(createSubscriptionTypeDto);
    
    const newSubscriptionType = await this.subscriptionTypesRepo.create(data);
    return SubscriptionTypeModel.fromEntity(newSubscriptionType);
  }

  async update(id: string, updateSubscriptionTypeDto: UpdateSubscriptionTypeDto): Promise<SubscriptionTypeModel> {
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