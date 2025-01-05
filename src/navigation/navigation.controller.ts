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
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('navigation')
@UseGuards(RolesGuard)
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới navigation', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Navigation đã tồn tại' },
    { status: 404, description: 'Không tìm thấy page' },
  ])
  create(@Body() createNavigationDto: CreateNavigationDto) {
    return this.navigationService.create(createNavigationDto);
  }

  @Get()
  @Description('Lấy danh sách navigation', [
    { status: 200, description: 'Thành công' },
  ])
  findAll(@Query('pageId') pageId?: string) {
    if (pageId) {
      return this.navigationService.findByPage(pageId);
    }
    return this.navigationService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin navigation', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy navigation' },
  ])
  findOne(@Param('id') id: string) {
    return this.navigationService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật navigation', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy navigation hoặc page' },
  ])
  update(
    @Param('id') id: string,
    @Body() updateNavigationDto: UpdateNavigationDto,
  ) {
    return this.navigationService.update(id, updateNavigationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa navigation', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy navigation' },
  ])
  remove(@Param('id') id: string) {
    return this.navigationService.remove(id);
  }
} 