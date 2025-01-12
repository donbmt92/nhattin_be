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
import { DiscountService } from './discount.service';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { UserRole } from '../users/enum/role.enum';
import { CreateDiscountDto } from './dto/create-discount.dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto/update-discount.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Discounts')
@ApiBearerAuth()
@Control('discounts')
@UseGuards(RolesGuard)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mới khuyến mãi' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Khuyến mãi đã tồn tại' })
  @Description('Tạo mới khuyến mãi', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Khuyến mãi đã tồn tại' },
  ])
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Description('Lấy danh sách khuyến mãi', [
    { status: 200, description: 'Thành công' },
  ])
  findAll() {
    return this.discountService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi đang hoạt động' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Description('Lấy danh sách khuyến mãi đang hoạt động', [
    { status: 200, description: 'Thành công' },
  ])
  findActive() {
    return this.discountService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @Description('Lấy thông tin khuyến mãi', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy khuyến mãi' },
  ])
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @Description('Cập nhật khuyến mãi', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy khuyến mãi' },
  ])
  update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @Description('Xóa khuyến mãi', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy khuyến mãi' },
  ])
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
