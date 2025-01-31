/* eslint-disable prettier/prettier */
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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('categories')
@UseGuards(RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới danh mục', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Danh mục đã tồn tại' }
  ])
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Description('Lấy danh sách danh mục', [
    { status: 200, description: 'Thành công' }
  ])
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.categoryService.findByType(type);
    }
    return this.categoryService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin danh mục', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật danh mục', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa danh mục', [
    { status: 200, description: 'Xóa thành công' },
    { status: 400, description: 'Danh mục đã tồn tại' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  remove(@Param('id') id: string) {
    console.log('id', id);
    return this.categoryService.remove(id);
  }
}
