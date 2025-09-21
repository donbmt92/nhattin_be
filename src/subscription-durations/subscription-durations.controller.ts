/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionDurationsService } from './subscription-durations.service';
import { CreateSubscriptionDurationDto } from './dto/create-subscription-duration.dto';
import { UpdateSubscriptionDurationDto } from './dto/update-subscription-duration.dto';
import { SubscriptionDurationModel } from './models/subscription-duration.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enum/role.enum';
import { Logger } from '@nestjs/common';

@ApiTags('subscription-durations')
@ApiBearerAuth()
@Controller('subscription-durations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionDurationsController {
  private readonly logger = new Logger(SubscriptionDurationsController.name);

  constructor(private readonly subscriptionDurationsService: SubscriptionDurationsService) {}

  @Get('product/:product_id')
  @ApiOperation({ summary: 'Lấy danh sách thời hạn gói đăng ký theo product_id' })
  @ApiResponse({ status: 200, description: 'Danh sách thời hạn gói đăng ký', type: [SubscriptionDurationModel] })
  async findByProductId(@Param('product_id') productId: string): Promise<SubscriptionDurationModel[]> {
    this.logger.log(`Finding subscription durations by product_id: ${productId}`);
    return this.subscriptionDurationsService.findByProductId(productId);
  }

  @Get('subscription-type/:subscription_type_id')
  @ApiOperation({ summary: 'Lấy danh sách thời hạn gói đăng ký theo subscription_type_id' })
  @ApiResponse({ status: 200, description: 'Danh sách thời hạn gói đăng ký', type: [SubscriptionDurationModel] })
  async findBySubscriptionTypeId(@Param('subscription_type_id') subscriptionTypeId: string): Promise<SubscriptionDurationModel[]> {
    this.logger.log(`Finding subscription durations by subscription_type_id: ${subscriptionTypeId}`);
    return this.subscriptionDurationsService.findBySubscriptionTypeId(subscriptionTypeId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thời hạn gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Danh sách thời hạn gói đăng ký', type: [SubscriptionDurationModel] })
  async findAll(@Query('product_id') productId?: string): Promise<SubscriptionDurationModel[]> {
    if (productId) {
      return this.subscriptionDurationsService.findByProductId(productId);
    }
    return this.subscriptionDurationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thời hạn gói đăng ký theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin thời hạn gói đăng ký', type: SubscriptionDurationModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thời hạn gói đăng ký' })
  async findById(@Param('id') id: string): Promise<SubscriptionDurationModel> {
    return this.subscriptionDurationsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo thời hạn gói đăng ký mới' })
  @ApiResponse({ status: 201, description: 'Thời hạn gói đăng ký đã được tạo', type: SubscriptionDurationModel })
  async create(@Body() createSubscriptionDurationDto: CreateSubscriptionDurationDto): Promise<SubscriptionDurationModel> {
    return this.subscriptionDurationsService.create(createSubscriptionDurationDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin thời hạn gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Thời hạn gói đăng ký đã được cập nhật', type: SubscriptionDurationModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thời hạn gói đăng ký' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDurationDto: UpdateSubscriptionDurationDto
  ): Promise<SubscriptionDurationModel> {
    return this.subscriptionDurationsService.update(id, updateSubscriptionDurationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa thời hạn gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Thời hạn gói đăng ký đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thời hạn gói đăng ký' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.subscriptionDurationsService.delete(id);
  }
} 