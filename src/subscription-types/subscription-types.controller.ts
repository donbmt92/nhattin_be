/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionTypesService } from './subscription-types.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-type.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-type.dto';
import { SubscriptionTypeModel } from './models/subscription-type.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enum/role.enum';

@ApiTags('subscription-types')
@ApiBearerAuth()
@Controller('subscription-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionTypesController {
  private readonly logger = new Logger(SubscriptionTypesController.name);

  constructor(private readonly subscriptionTypesService: SubscriptionTypesService) {}

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy danh sách loại gói đăng ký theo trạng thái' })
  @ApiResponse({ status: 200, description: 'Danh sách loại gói đăng ký', type: [SubscriptionTypeModel] })
  async findByStatus(@Param('status') status: string): Promise<SubscriptionTypeModel[]> {
    this.logger.log(`Finding subscription types by status: ${status}`);
    return this.subscriptionTypesService.findByStatus(status);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả loại gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Danh sách loại gói đăng ký', type: [SubscriptionTypeModel] })
  async findAll(@Query('product_id') productId?: string, @Query('with_durations') withDurations?: string): Promise<SubscriptionTypeModel[] | any[]> {
    if (productId) {
      this.logger.log(`Finding all subscription types with product_id: ${productId}`);
      if (withDurations === 'true') {
        return this.subscriptionTypesService.findByProductIdWithDurations(productId);
      }
      return this.subscriptionTypesService.findByProductId(productId);
    }
    this.logger.log('Finding all subscription types without product_id');
    return this.subscriptionTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại gói đăng ký theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin loại gói đăng ký', type: SubscriptionTypeModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại gói đăng ký' })
  async findById(@Param('id') id: string): Promise<SubscriptionTypeModel> {
    this.logger.log(`Finding subscription type by ID: ${id}`);
    return this.subscriptionTypesService.findById(id);
  }


  // @Get('product/:product_id')
  // @ApiOperation({ summary: 'Lấy danh sách loại gói đăng ký theo product_id' })
  // @ApiResponse({ status: 200, description: 'Danh sách loại gói đăng ký', type: [SubscriptionTypeModel] })
  // async findByProductId(@Param('product_id') productId: string): Promise<SubscriptionTypeModel[]> {
  //   this.logger.log(`Finding subscription types by product_id: ${productId}`);
  //   return this.subscriptionTypesService.findByProductId(productId);
  // }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo loại gói đăng ký mới' })
  @ApiResponse({ status: 201, description: 'Loại gói đăng ký đã được tạo', type: SubscriptionTypeModel })
  async create(@Body() createSubscriptionTypeDto: CreateSubscriptionTypeDto): Promise<SubscriptionTypeModel> {
    this.logger.log(`Creating subscription type: ${JSON.stringify(createSubscriptionTypeDto)}`);
    return this.subscriptionTypesService.create(createSubscriptionTypeDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin loại gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Loại gói đăng ký đã được cập nhật', type: SubscriptionTypeModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại gói đăng ký' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionTypeDto: UpdateSubscriptionTypeDto
  ): Promise<SubscriptionTypeModel> {
    this.logger.log(`Updating subscription type with ID: ${id} and data: ${JSON.stringify(updateSubscriptionTypeDto)}`);
    return this.subscriptionTypesService.update(id, updateSubscriptionTypeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa loại gói đăng ký' })
  @ApiResponse({ status: 204, description: 'Loại gói đăng ký đã được xóa' })
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting subscription type with ID: ${id}`);
    return this.subscriptionTypesService.delete(id);
  } 
} 