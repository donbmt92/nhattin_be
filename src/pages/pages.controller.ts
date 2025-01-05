import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('pages')
@UseGuards(RolesGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới trang', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Trang đã tồn tại' },
  ])
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Get()
  @Description('Lấy danh sách trang', [
    { status: 200, description: 'Thành công' },
  ])
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin trang', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy trang' },
  ])
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật trang', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy trang' },
  ])
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa trang', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy trang' },
  ])
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
} 