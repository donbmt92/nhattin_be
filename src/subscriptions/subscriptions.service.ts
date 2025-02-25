/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionsRepo } from './subscriptions.repo';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionModel } from './models/subscription.model';
import { ProductsService } from '../products/products.service';
import { SubscriptionTypesService } from '../subscription-types/subscription-types.service';
import { SubscriptionDurationsService } from '../subscription-durations/subscription-durations.service';
import { MongooseUtils } from '../common/utils/mongoose.utils';
import { Types } from 'mongoose';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepo: SubscriptionsRepo,
    private readonly productsService: ProductsService,
    private readonly subscriptionTypesService: SubscriptionTypesService,
    private readonly subscriptionDurationsService: SubscriptionDurationsService
  ) {}

  async findAll(): Promise<SubscriptionModel[]> {
    const subscriptions = await this.subscriptionsRepo.findAll();
    return SubscriptionModel.fromEntities(subscriptions);
  }

  async findByUserId(userId: string): Promise<SubscriptionModel[]> {
    const subscriptions = await this.subscriptionsRepo.findByUserId(userId);
    return SubscriptionModel.fromEntities(subscriptions);
  }

  async findOne(id: string, userId?: string): Promise<SubscriptionModel> {
    const subscription = await this.subscriptionsRepo.findById(id);
    
    if (!subscription) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }
    
    // Nếu có userId, kiểm tra xem đăng ký có thuộc về người dùng này không
    if (userId && subscription.user_id.toString() !== userId) {
      throw new NotFoundException(`Không tìm thấy đăng ký với ID ${id}`);
    }
    
    return SubscriptionModel.fromEntity(subscription);
  }

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string): Promise<SubscriptionModel> {
    try {
      // Chuyển đổi string ID sang ObjectId
      const data = MongooseUtils.convertToObjectIds(createSubscriptionDto);
      
      // Kiểm tra sản phẩm tồn tại
      await this.productsService.findById(createSubscriptionDto.product_id);
      
      // Kiểm tra loại gói đăng ký tồn tại
      const subscriptionType = await this.subscriptionTypesService.findById(createSubscriptionDto.subscription_type_id);
      console.log('Loại gói đăng ký:', subscriptionType.name);
      
      // Kiểm tra thời hạn gói đăng ký tồn tại
      const subscriptionDuration = await this.subscriptionDurationsService.findById(createSubscriptionDto.subscription_duration_id);
      
      // Tính ngày bắt đầu và kết thúc
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + subscriptionDuration.days);
      
      // Tạo đăng ký mới
      const newSubscription = await this.subscriptionsRepo.create({
        user_id: new Types.ObjectId(userId),
        product_id: data.product_id,
        subscription_type_id: data.subscription_type_id,
        subscription_duration_id: data.subscription_duration_id,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        notes: createSubscriptionDto.notes
      });
      
      return SubscriptionModel.fromEntity(newSubscription);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo đăng ký: ${error.message}`);
    }
  }
} 