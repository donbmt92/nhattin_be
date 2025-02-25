import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { Role } from '../users/enum/role.enum';
import { CreateDiscountDto } from './dto/create-discount.dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto/update-discount.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes
} from '@nestjs/swagger';

@ApiTags('Discounts')
@ApiBearerAuth()
@Control('discounts')
@UseGuards(RolesGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  })
)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo mới khuyến mãi' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Khuyến mãi đã tồn tại' })
  @Description('Tạo mới khuyến mãi', [
    { status: 201, description: 'Tạo thành công' },
    { status: 400, description: 'Khuyến mãi đã tồn tại' }
  ])
  @ApiConsumes('application/json', 'multipart/form-data')
  create(@Body() createDiscountDto: CreateDiscountDto) {
    try {
      // Convert form data values to appropriate types
      if (typeof createDiscountDto.discount_percent === 'string') {
        createDiscountDto.discount_percent = Number(
          createDiscountDto.discount_percent
        );
      }

      console.log('Received DTO:', createDiscountDto);
      return this.discountService.create(createDiscountDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Description('Lấy danh sách khuyến mãi', [
    { status: 200, description: 'Thành công' }
  ])
  findAll() {
    return this.discountService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách khuyến mãi đang hoạt động' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @Description('Lấy danh sách khuyến mãi đang hoạt động', [
    { status: 200, description: 'Thành công' }
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
    { status: 404, description: 'Không tìm thấy khuyến mãi' }
  ])
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @Description('Cập nhật khuyến mãi', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy khuyến mãi' }
  ])
  update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto
  ) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa khuyến mãi' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khuyến mãi' })
  @Description('Xóa khuyến mãi', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy khuyến mãi' }
  ])
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
