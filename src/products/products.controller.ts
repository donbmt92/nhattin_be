import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới sản phẩm', [
    { status: 201, description: 'Tạo thành công' },
    { status: 404, description: 'Không tìm thấy danh mục' },
  ])
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Description('Lấy danh sách sản phẩm', [
    { status: 200, description: 'Thành công' },
  ])
  findAll(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      return this.productsService.findByCategory(categoryId);
    }
    return this.productsService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin sản phẩm', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy sản phẩm' },
  ])
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật sản phẩm', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy sản phẩm hoặc danh mục' },
  ])
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa sản phẩm', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy sản phẩm' },
  ])
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
} 