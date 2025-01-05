import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InventoryLogsService } from './inventory-logs.service';
import { CreateInventoryLogDto } from './dto/create-inventory-log.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('inventory-logs')
@UseGuards(RolesGuard)
export class InventoryLogsController {
  constructor(private readonly inventoryLogsService: InventoryLogsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới log', [
    { status: 201, description: 'Tạo thành công' },
    { status: 404, description: 'Không tìm thấy inventory' },
  ])
  create(@Body() createInventoryLogDto: CreateInventoryLogDto) {
    return this.inventoryLogsService.create(createInventoryLogDto);
  }

  @Get()
  @Description('Lấy danh sách logs', [
    { status: 200, description: 'Thành công' },
  ])
  findAll() {
    return this.inventoryLogsService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin log', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy log' },
  ])
  findOne(@Param('id') id: string) {
    return this.inventoryLogsService.findOne(id);
  }

  @Get('inventory/:id')
  @Description('Lấy logs theo inventory', [
    { status: 200, description: 'Thành công' },
  ])
  findByInventoryId(@Param('id') id: string) {
    return this.inventoryLogsService.findByInventoryId(id);
  }
} 