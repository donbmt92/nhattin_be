/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/meta/role.meta';
import { Role } from '../users/enum/role.enum';
import { User } from '../common/meta/user.meta';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Đăng ký gói dịch vụ' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm, loại gói hoặc thời hạn' })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @User('id') userId: string
  ) {
    return this.subscriptionsService.create(createSubscriptionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đăng ký của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách đăng ký' })
  async findAll(@User('id') userId: string) {
    return this.subscriptionsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đăng ký' })
  @ApiParam({ name: 'id', description: 'ID của đăng ký' })
  @ApiResponse({ status: 200, description: 'Thông tin đăng ký' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  async findOne(@Param('id') id: string, @User('id') userId: string) {
    return this.subscriptionsService.findOne(id, userId);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả đăng ký (chỉ dành cho Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả đăng ký' })
  async findAllForAdmin() {
    return this.subscriptionsService.findAll();
  }
} 