/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionTypesService } from './subscription-types.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-type.dto';
import { SubscriptionTypeModel } from './models/subscription-type.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enum/role.enum';

@ApiTags('subscription-types')
@Controller('subscription-types')
export class SubscriptionTypesController {
  constructor(private readonly subscriptionTypesService: SubscriptionTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả loại gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Danh sách loại gói đăng ký', type: [SubscriptionTypeModel] })
  async findAll(@Query('product_id') productId?: string): Promise<SubscriptionTypeModel[]> {
    if (productId) {
      return this.subscriptionTypesService.findByProductId(productId);
    }
    return this.subscriptionTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại gói đăng ký theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin loại gói đăng ký', type: SubscriptionTypeModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại gói đăng ký' })
  async findById(@Param('id') id: string): Promise<SubscriptionTypeModel> {
    return this.subscriptionTypesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo loại gói đăng ký mới' })
  @ApiResponse({ status: 201, description: 'Loại gói đăng ký đã được tạo', type: SubscriptionTypeModel })
  async create(@Body() createSubscriptionTypeDto: CreateSubscriptionTypeDto): Promise<SubscriptionTypeModel> {
    return this.subscriptionTypesService.create(createSubscriptionTypeDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin loại gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Loại gói đăng ký đã được cập nhật', type: SubscriptionTypeModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại gói đăng ký' })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionTypeDto: Partial<CreateSubscriptionTypeDto>
  ): Promise<SubscriptionTypeModel> {
    return this.subscriptionTypesService.update(id, updateSubscriptionTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa loại gói đăng ký' })
  @ApiResponse({ status: 200, description: 'Loại gói đăng ký đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại gói đăng ký' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.subscriptionTypesService.delete(id);
  }
} 