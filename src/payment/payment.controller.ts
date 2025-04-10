import { Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
// import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { Role } from '../users/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Control('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(Role.USER)
  @Description('Tạo mới thanh toán', [
    { status: 201, description: 'Tạo thành công' },
    { status: 404, description: 'Không tìm thấy đơn hàng' },
    { status: 400, description: 'Đơn hàng đã thanh toán' }
  ])
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @Description('Lấy danh sách thanh toán', [
    { status: 200, description: 'Thành công' }
  ])
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin thanh toán', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy thanh toán' }
  ])
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @Description('Cập nhật thanh toán', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy thanh toán hoặc đơn hàng' }
  ])
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Description('Xóa thanh toán', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy thanh toán' }
  ])
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
