/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/meta/user.meta';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Role } from 'src/users/enum/role.enum';
import { Roles } from 'src/common/meta/role.meta';

const CART_RESPONSE = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      description: 'ID của item trong giỏ hàng',
      example: '65f2e0a3a2e0c60c848d3e12'
    },
    uid: {
      type: 'string', 
      description: 'ID của người dùng',
      example: '65f2e0a3a2e0c60c848d3e13'
    },
    id_product: {
      type: 'string',
      description: 'ID của sản phẩm',
      example: '65f2e0a3a2e0c60c848d3e14'
    },
    quantity: {
      type: 'number',
      description: 'Số lượng sản phẩm',
      minimum: 1,
      example: 1
    }
  }
};

@ApiTags('Carts')
@ApiBearerAuth('access-token')
@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ 
    summary: 'Thêm sản phẩm vào giỏ hàng',
    description: 'Thêm một sản phẩm mới vào giỏ hàng hoặc cập nhật số lượng nếu sản phẩm đã tồn tại'
  })
  @ApiBody({
    type: CreateCartDto,
    description: 'Thông tin sản phẩm thêm vào giỏ hàng',
    examples: {
      example1: {
        value: {
          id_product: "6783986205306e7b3a633bdb",
          quantity: 1
        },
        summary: "Thêm sản phẩm vào giỏ hàng"
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Thêm vào giỏ hàng thành công',
    schema: CART_RESPONSE
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi thêm vào giỏ hàng:\n' +
      '- ID sản phẩm không hợp lệ\n' +
      '- Số lượng phải lớn hơn 0'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm'
  })
  addToCart(@User() user: any, @Body() createCartDto: CreateCartDto) {
    console.log('User ID:', user);
    console.log('Create Cart DTO:', createCartDto);
    return this.cartsService.addToCart(user.sub, createCartDto);
  }

  @Get()
  @Roles(Role.USER)
  @ApiOperation({ 
    summary: 'Xem giỏ hàng của người dùng',
    description: 'Lấy danh sách các sản phẩm trong giỏ hàng của người dùng hiện tại'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm trong giỏ hàng',
    schema: {
      type: 'array',
      items: CART_RESPONSE
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  getUserCart(@User('_id') userId: any) {
    console.log('User ID:', userId);
    return this.cartsService.getUserCart(userId);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng',
    description: 'Cập nhật số lượng của một sản phẩm trong giỏ hàng. Nếu số lượng <= 0, sản phẩm sẽ bị xóa khỏi giỏ hàng'
  })
  @ApiParam({
    name: 'id',
    description: 'ID của item trong giỏ hàng',
    type: 'string'
  })
  @ApiBody({
    type: UpdateCartDto,
    description: 'Số lượng mới của sản phẩm',
    examples: {
      example1: {
        value: {
          quantity: 2
        },
        summary: "Cập nhật số lượng sản phẩm"
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật giỏ hàng thành công',
    schema: CART_RESPONSE
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi cập nhật giỏ hàng:\n' +
      '- ID giỏ hàng không hợp lệ\n' +
      '- Số lượng không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm trong giỏ hàng'
  })
  updateCartItem(
    @User('sub') userId: any,
    @Param('id') cartItemId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    console.log('User ID:', userId);
    return this.cartsService.updateCartItem(userId, cartItemId, updateCartDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Xóa sản phẩm khỏi giỏ hàng',
    description: 'Xóa một sản phẩm khỏi giỏ hàng của người dùng'
  })
  @ApiParam({
    name: 'id',
    description: 'ID của item trong giỏ hàng',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm khỏi giỏ hàng thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'ID giỏ hàng không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm trong giỏ hàng'
  })
  removeFromCart(@User('_id') userId: string, @Param('id') cartItemId: string) {
    return this.cartsService.removeFromCart(userId, cartItemId);
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Xóa toàn bộ giỏ hàng',
    description: 'Xóa tất cả sản phẩm trong giỏ hàng của người dùng'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa giỏ hàng thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'ID người dùng không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập - Yêu cầu đăng nhập'
  })
  clearCart(@User('_id') userId: string) {
    return this.cartsService.clearCart(userId);
  }
}
