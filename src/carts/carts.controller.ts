import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param,
  UseGuards 
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { User } from '../common/meta/user.meta';
import { RolesGuard } from '../auth/guard/role.guard';
import { CartsService } from './carts.service';

@Control('carts')
@UseGuards(RolesGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @Description('Thêm sản phẩm vào giỏ hàng', [
    { status: 201, description: 'Thêm thành công' },
    { status: 400, description: 'Số lượng không đủ' },
  ])
  async addToCart(@User() userId: string, @Body() createCartDto: CreateCartDto) {
    return await this.cartsService.addToCart(userId, createCartDto);
  }

  @Get()
  @Description('Lấy thông tin giỏ hàng', [
    { status: 200, description: 'Thành công' },
  ])
  async getUserCart(@User() userId: string) {
    return await this.cartsService.getUserCart(userId);
  }

  @Put(':id')
  @Description('Cập nhật số lượng sản phẩm', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 400, description: 'Số lượng không đủ' },
  ])
  async updateCartItem(
    @User() userId: string,
    @Param('id') cartItemId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return await this.cartsService.updateCartItem(userId, cartItemId, updateCartDto);
  }

  @Delete(':id')
  @Description('Xóa sản phẩm khỏi giỏ hàng', [
    { status: 200, description: 'Xóa thành công' },
  ])
  async removeFromCart(@User() userId: string, @Param('id') cartItemId: string) {
    return await this.cartsService.removeFromCart(userId, cartItemId);
  }

  @Delete()
  @Description('Xóa toàn bộ giỏ hàng', [
    { status: 200, description: 'Xóa thành công' },
  ])
  async clearCart(@User() userId: string) {
    return await this.cartsService.clearCart(userId);
  }
} 