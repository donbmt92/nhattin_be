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
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('warehouses')
@UseGuards(RolesGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới kho', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Kho đã tồn tại' }
  ])
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @Description('Lấy danh sách kho', [
    { status: 200, description: 'Thành công' }
  ])
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin kho', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy kho' }
  ])
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật kho', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy kho' }
  ])
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa kho', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy kho' }
  ])
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
