import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InventoryLogsService } from './inventory-logs.service';
import { CreateInventoryLogDto } from './dto/create-inventory-log.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InventoryLog } from './schemas/inventory-log.schema';

@ApiTags('Inventory Logs')
@ApiBearerAuth()
@Controller('inventory-logs')
@UseGuards(RolesGuard)
export class InventoryLogsController {
  constructor(private readonly inventoryLogsService: InventoryLogsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mới log giao dịch tồn kho (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo log thành công',
    type: InventoryLog
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy inventory'
  })
  create(@Body() createInventoryLogDto: CreateInventoryLogDto) {
    return this.inventoryLogsService.create(createInventoryLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách logs giao dịch tồn kho' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách logs',
    type: [InventoryLog]
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  findAll() {
    return this.inventoryLogsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết log giao dịch' })
  @ApiParam({
    name: 'id',
    description: 'ID của log',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin log',
    type: InventoryLog
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy log'
  })
  findOne(@Param('id') id: string) {
    return this.inventoryLogsService.findOne(id);
  }

  @Get('inventory/:id')
  @ApiOperation({ summary: 'Lấy danh sách logs theo inventory' })
  @ApiParam({
    name: 'id',
    description: 'ID của inventory',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách logs của inventory',
    type: [InventoryLog]
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  findByInventoryId(@Param('id') id: string) {
    return this.inventoryLogsService.findByInventoryId(id);
  }
} 