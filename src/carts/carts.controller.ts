/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { CartsService } from './carts.service';
import { User } from '../common/meta/user.meta';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Cart } from './schemas/cart.schema';

@ApiTags('Carts')
@ApiBearerAuth()
@Controller('carts')
@UseGuards(RolesGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiResponse({
    status: 201,
    description: 'Thêm sản phẩm vào giỏ hàng thành công',
    type: Cart
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc số lượng không đủ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  async addToCart(
    @User() userId: string,
    @Body() createCartDto: CreateCartDto,
  ) {
    return await this.cartsService.addToCart(userId, createCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin giỏ hàng của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin giỏ hàng thành công',
    type: [Cart]
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  async getUserCart(@User() userId: string) {
    return await this.cartsService.getUserCart(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của item trong giỏ hàng',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượng thành công',
    type: Cart
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc số lượng không đủ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm trong giỏ hàng'
  })
  async updateCartItem(
    @User() userId: string,
    @Param('id') cartItemId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return await this.cartsService.updateCartItem(
      userId,
      cartItemId,
      updateCartDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của item trong giỏ hàng',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm trong giỏ hàng'
  })
  async removeFromCart(
    @User() userId: string,
    @Param('id') cartItemId: string,
  ) {
    return await this.cartsService.removeFromCart(userId, cartItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng' })
  @ApiResponse({
    status: 200,
    description: 'Xóa giỏ hàng thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  async clearCart(@User() userId: string) {
    return await this.cartsService.clearCart(userId);
  }
}
