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
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Inventory } from './schemas/inventory.schema';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mới inventory (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo inventory thành công',
    type: Inventory
  })
  @ApiResponse({
    status: 400,
    description: 'Inventory đã tồn tại hoặc dữ liệu không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy warehouse hoặc product'
  })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách inventory' })
  @ApiQuery({
    name: 'warehouseId',
    required: false,
    description: 'ID của kho hàng để lọc inventory'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách inventory',
    type: [Inventory]
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  findAll(@Query('warehouseId') warehouseId?: string) {
    if (warehouseId) {
      return this.inventoryService.findByWarehouse(warehouseId);
    }
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết inventory' })
  @ApiParam({
    name: 'id',
    description: 'ID của inventory',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin inventory',
    type: Inventory
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy inventory'
  })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật số lượng inventory (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID của inventory',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật inventory thành công',
    type: Inventory
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy inventory'
  })
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa inventory (Admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID của inventory',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa inventory thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy inventory'
  })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Get('check-stock/:productId')
  @ApiOperation({ summary: 'Kiểm tra tồn kho của sản phẩm' })
  @ApiParam({
    name: 'productId',
    description: 'ID của sản phẩm',
    type: 'string'
  })
  @ApiQuery({
    name: 'quantity',
    description: 'Số lượng cần kiểm tra',
    type: 'number',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra tồn kho',
    schema: {
      type: 'boolean',
      example: true,
      description: 'true nếu đủ hàng, false nếu không đủ'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Không có quyền truy cập'
  })
  checkStock(
    @Param('productId') productId: string,
    @Query('quantity') quantity: number,
  ) {
    return this.inventoryService.checkStock(productId, quantity);
  }
} 