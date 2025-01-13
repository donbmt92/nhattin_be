/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/meta/user.meta';

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
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
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
  create(@User('_id') userId: string, @Body() createOrderDto: CreateOrderDto) {
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
  findMyOrders(@User('_id') userId: string) {
    console.log('findMyOrders', userId);
    return this.ordersService.findByUser(userId);
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
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
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
} 