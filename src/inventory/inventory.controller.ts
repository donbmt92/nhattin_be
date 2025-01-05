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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';

@Control('inventory')
@UseGuards(RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @Description('Tạo mới inventory', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Inventory đã tồn tại' },
    { status: 404, description: 'Không tìm thấy warehouse hoặc product' },
  ])
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @Description('Lấy danh sách inventory', [
    { status: 200, description: 'Thành công' },
  ])
  findAll(@Query('warehouseId') warehouseId?: string) {
    if (warehouseId) {
      return this.inventoryService.findByWarehouse(warehouseId);
    }
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin inventory', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy inventory' },
  ])
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @Description('Cập nhật số lượng inventory', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy inventory' },
  ])
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @Description('Xóa inventory', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy inventory' },
  ])
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Get('check-stock/:productId')
  @Description('Kiểm tra tồn kho của sản phẩm', [
    { status: 200, description: 'Thành công' },
  ])
  checkStock(
    @Param('productId') productId: string,
    @Query('quantity') quantity: number,
  ) {
    return this.inventoryService.checkStock(productId, quantity);
  }
} 