/* eslint-disable prettier/prettier */
import {
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { Roles } from '../common/meta/role.meta';
import { Role } from '../users/enum/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { multerConfig } from '../config/multer.config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { Product } from './schemas/product.schema';

@ApiTags('Products')
@ApiBearerAuth()
@Control('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Tạo mới sản phẩm',
    description: 'Tạo mới sản phẩm với thông tin cơ bản và hình ảnh'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo sản phẩm thành công',
    type: Product
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  @Description('Tạo mới sản phẩm', [
    { status: 201, description: 'Tạo thành công' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log(createProductDto);

    return this.productsService.create(createProductDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm',
    description: 'Lấy tất cả sản phẩm hoặc lọc theo danh mục'
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'ID của danh mục cần lọc',
    type: 'string',
    example: '65abc123def456'
  })
  @ApiResponse({
    status: 200,
    description: 'Thành công',
    type: [Product]
  })
  @Description('Lấy danh sách sản phẩm', [
    { status: 200, description: 'Thành công' }
  ])
  async findAll(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      const products = await this.productsService.findByCategory(categoryId);
      console.log('Products by category:', JSON.stringify(products, null, 2));
      return products;
    }
    
    const products = await this.productsService.findAll();
    console.log('All products:', products);
    return products;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin sản phẩm',
    description: 'Lấy thông tin chi tiết của một sản phẩm theo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm',
    example: '65abc123def456'
  })
  @ApiResponse({
    status: 200,
    description: 'Thành công',
    type: Product
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  @Description('Lấy thông tin sản phẩm', [
    { status: 200, description: 'Thành công' },
    { status: 404, description: 'Không tìm thấy sản phẩm' }
  ])
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Cập nhật sản phẩm',
    description: 'Cập nhật thông tin sản phẩm theo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm cần cập nhật',
    example: '65abc123def456'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: Product
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm hoặc danh mục'
  })
  @Description('Cập nhật sản phẩm', [
    { status: 200, description: 'Cập nhật thành công' },
    { status: 404, description: 'Không tìm thấy sản phẩm hoặc danh mục' }
  ])
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log('update', id, updateProductDto, file);
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Xóa sản phẩm',
    description: 'Xóa sản phẩm theo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sản phẩm cần xóa',
    example: '65abc123def456'
  })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  @Description('Xóa sản phẩm', [
    { status: 200, description: 'Xóa thành công' },
    { status: 404, description: 'Không tìm thấy sản phẩm' }
  ])
  remove(@Param('id') id: string) {
    console.log('delete', id);
    const result = this.productsService.remove(id);
    return result;
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết sản phẩm bao gồm loại gói và thời hạn' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết sản phẩm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async getProductDetails(@Param('id') id: string) {
    return this.productsService.getProductDetails(id);
  }
}
