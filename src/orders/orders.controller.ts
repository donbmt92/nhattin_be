import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto'
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Description('Tạo mới đơn hàng', [
    { status: 201, description: 'Tạo thành công' },
  ])
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @Description('Lấy danh sách đơn hàng', [
    { status: 200, description: 'Thành công' },
  ])
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('my-orders')
  @Description('Lấy danh sách đơn hàng của tôi', [
    { status: 200, description: 'Thành công' },
  ])
  findMyOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.id);
  }

  @Get(':id')
  @Description('Lấy thông tin đơn hàng', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy đơn hàng' },
  ])
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật đơn hàng', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy đơn hàng' },
  ])
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa đơn hàng', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy đơn hàng' },
  ])
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
} 