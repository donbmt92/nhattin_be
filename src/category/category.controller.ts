/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Logger,
  OnModuleInit,
  Patch
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';
import { User } from '../common/meta/user.meta';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@Control('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {
    this.logger.log('CategoryController initialized');
  }

  @Post()
  // @Roles(UserRole.ADMIN)
  @Description('Tạo mới danh mục', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Danh mục đã tồn tại' }
  ])
  async create(@Body() createCategoryDto: CreateCategoryDto, @User() user) {
    this.logger.log('=== Create Category Request ===');
    this.logger.log(`Request from user: ${JSON.stringify(user)}`);
    this.logger.log(`Category data: ${JSON.stringify(createCategoryDto)}`);
    
    try {
      const result = await this.categoryService.create(createCategoryDto);
      this.logger.log(`Category created successfully: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @Description('Lấy danh sách danh mục', [
    { status: 200, description: 'Thành công' }
  ])
  findAll(@Query('type') type?: string) {
    console.log('Getting all categories, type:', type);
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
    console.log('Getting category by id:', id);
    return this.categoryService.findOne(id);
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật danh mục', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  update(
    @Query('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    console.log('Updating category:', id, updateCategoryDto);
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete()
  @Roles(UserRole.ADMIN)
  @Description('Xóa danh mục', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  remove(@Query('id') id: string) {
    console.log('Removing category:', id);
    return this.categoryService.remove(id);
  }
}
