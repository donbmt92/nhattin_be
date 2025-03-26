/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../common/meta/user.meta';
import { Roles } from '../common/meta/role.meta';
import { Role } from '../users/enum/role.enum';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';
import { OrderStatus } from './enum/order-status.enum';

// Swagger response schemas
const CREATE_ORDER_RESPONSE = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'ID của đơn hàng',
      example: '65f2e0a3a2e0c60c848d3e12'
    },
    uid: {
      type: 'string',
      description: 'ID của người dùng đặt hàng',
      example: '65f2e0a3a2e0c60c848d3e13'
    },
    id_payment: {
      type: 'string',
      description: 'ID của phương thức thanh toán (optional)',
      example: '65f2e0a3a2e0c60c848d3e14'
    },
    note: {
      type: 'string',
      description: 'Ghi chú đơn hàng',
      example: 'Giao hàng trong giờ hành chính'
    },
    total: {
      type: 'number',
      description: 'Tổng tiền đơn hàng',
      minimum: 0,
      example: 1000000
    },
    voucher: {
      type: 'string',
      description: 'Mã voucher (optional)',
      example: 'SUMMER2024'
    },
    status: {
      type: 'string',
      description: 'Trạng thái đơn hàng',
      enum: Object.values(OrderStatus),
      example: OrderStatus.PENDING
    },
    items: {
      type: 'array',
      description: 'Danh sách sản phẩm trong đơn hàng',
      items: {
        type: 'object',
        properties: {
          id: { 
            type: 'string',
            description: 'ID của item trong đơn hàng'
          },
          product: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'ID của sản phẩm' },
              name: { type: 'string', description: 'Tên sản phẩm' },
              price: { type: 'number', description: 'Giá sản phẩm' },
              images: { 
                type: 'array',
                items: { type: 'string' },
                description: 'Danh sách hình ảnh sản phẩm'
              },
              description: { type: 'string', description: 'Mô tả sản phẩm' }
            }
          },
          quantity: { type: 'number', description: 'Số lượng sản phẩm' },
          discount_precent: { type: 'number', description: 'Phần trăm giảm giá' },
          old_price: { type: 'number', description: 'Giá gốc sản phẩm' },
          price: { type: 'number', description: 'Giá sau khi giảm giá' },
          subtotal: { type: 'number', description: 'Tổng giá trị của sản phẩm' }
        }
      }
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Thời gian tạo đơn hàng'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Thời gian cập nhật đơn hàng'
    }
  }
};

const ORDER_EXAMPLES = {
  withPaymentAndVoucher: {
    value: {
      id_payment: "65f2e0a3a2e0c60c848d3e12",
      note: "Giao hàng trong giờ hành chính",
      total: 1000000,
      voucher: "SUMMER2024",
      status: OrderStatus.PENDING
    },
    summary: "Đơn hàng với thanh toán và voucher"
  },
  basicOrder: {
    value: {
      note: "Giao hàng ngoài giờ",
      total: 500000,
      status: OrderStatus.PENDING
    },
    summary: "Đơn hàng cơ bản"
  }
};

const UPDATE_ORDER_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: Object.values(OrderStatus),
      description: 'Trạng thái mới của đơn hàng',
      example: OrderStatus.PROCESSING
    }
  }
};

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@Control('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ 
    summary: 'Tạo đơn hàng từ giỏ hàng', 
    description: 'Chuyển đổi sản phẩm từ giỏ hàng thành đơn hàng mới. Quá trình này sẽ:\n' +
      '1. Kiểm tra tồn kho cho từng sản phẩm\n' +
      '2. Tạo đơn hàng mới với thông tin thanh toán và voucher (nếu có)\n' +
      '3. Tạo chi tiết đơn hàng (order items) từ giỏ hàng\n' +
      '4. Tính tổng tiền dựa trên giá sản phẩm và voucher\n' +
      '5. Cập nhật tồn kho sau khi đơn hàng được tạo\n' +
      '6. Tạo log giao dịch tồn kho\n' +
      '7. Xóa giỏ hàng sau khi tạo đơn hàng thành công'
  })
  @ApiBody({ 
    type: CreateOrderDto,
    description: 'Thông tin tạo đơn hàng',
    examples: ORDER_EXAMPLES
  })
  @ApiResponse({
    status: 201,
    description: 'Đơn hàng được tạo thành công',
    schema: CREATE_ORDER_RESPONSE
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi tạo đơn hàng:\n' +
      '- Giỏ hàng trống\n' +
      '- Số lượng sản phẩm trong kho không đủ\n' +
      '- Thông tin thanh toán không hợp lệ\n' +
      '- Mã voucher không hợp lệ hoặc đã hết hạn\n' +
      '- Tổng tiền không khớp với giá trị sản phẩm\n' +
      '- Trạng thái đơn hàng không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông tin:\n' +
      '- Sản phẩm không tồn tại\n' +
      '- Phương thức thanh toán không tồn tại\n' +
      '- Voucher không tồn tại'
  })
  create(@User('sub') userId: any, @Body() createOrderDto: CreateOrderDto) {
    console.log('create', userId, createOrderDto);
    return this.ordersService.createFromCart(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn hàng (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng',
    type: [Order]
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  findAll() {
    console.log('findAll');
    
    return this.ordersService.findAll();
  }


  @Get('my-orders')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của người dùng',
    type: [Order]
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  findMyOrders(@User('_id') userId: any) {
    console.log('findMyOrders', userId.toString());
    return this.ordersService.findByUser(userId.toString());
  }

  @Get('success-orders')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng thành công của người dùng' })
  findSuccessOrders(@User('_id') userId: any) {
    console.log('findSuccessOrders', userId.toString());
    return this.ordersService.findSuccessOrders(userId.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết đơn hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn hàng',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin đơn hàng',
    type: Order
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng'
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn hàng',
    type: 'string'
  })
  @ApiBody({ schema: UPDATE_ORDER_SCHEMA })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đơn hàng thành công',
    type: Order
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng'
  })
  update(@Param('id') id: string, @User('sub') userId: any, @Body() updateOrderDto: UpdateOrderDto) {
    console.log('update', id, updateOrderDto);
    return this.ordersService.updateStatus(id, updateOrderDto?.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn hàng',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa đơn hàng thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng'
  })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Get(':id/items')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Lấy danh sách sản phẩm trong đơn hàng',
    description: 'Lấy danh sách các sản phẩm đã đặt mua trong một đơn hàng cụ thể'
  })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn hàng',
    type: String,
    example: '65abc123def456'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm trong đơn hàng',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID của item trong đơn hàng' },
          product: { type: 'object', description: 'Thông tin sản phẩm' },
          quantity: { type: 'number', description: 'Số lượng sản phẩm' },
          discount_precent: { type: 'number', description: 'Phần trăm giảm giá' },
          old_price: { type: 'number', description: 'Giá gốc sản phẩm' },
          price: { type: 'number', description: 'Giá sau khi giảm giá' },
          subtotal: { type: 'number', description: 'Tổng giá trị của sản phẩm' }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng'
  })
  async getOrderItems(@Param('id') id: string) {
    try {
      // First check if the order exists
      await this.ordersService.findOne(id);
      
      // If order exists, get its items
      return this.ordersService.getOrderItems(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể lấy danh sách sản phẩm trong đơn hàng');
    }
  }

  @Get('user/my-orders')
  @Roles(Role.USER)
  @ApiOperation({ 
    summary: 'Lấy danh sách đơn hàng của người dùng hiện tại',
    description: 'Lấy danh sách tất cả đơn hàng của người dùng đã đăng nhập'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của người dùng',
    schema: {
      type: 'array',
      items: CREATE_ORDER_RESPONSE
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  async getMyOrders(@User() user: any) {
    try {
      if (!user || !user._id) {
        throw new UnauthorizedException('Không thể xác thực người dùng');
      }
      return this.ordersService.findByUser(user._id);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Không thể lấy danh sách đơn hàng');
    }
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @Description('Cập nhật trạng thái đơn hàng', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy đơn hàng' }
  ])
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Trạng thái mới của đơn hàng',
          example: 'completed'
        }
      }
    }
  })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
} 