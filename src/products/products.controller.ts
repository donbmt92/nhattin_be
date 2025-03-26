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
  UploadedFile,
  Controller
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
import { memoryStorage } from 'multer';
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
@Controller()
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiOperation({
    summary: 'Tạo mới sản phẩm',
    description: 'Tạo mới sản phẩm với thông tin cơ bản và hình ảnh'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        id_category: { type: 'string' },
        id_discount: { type: 'string' },
        id_inventory: { type: 'string' },
        base_price: { type: 'number' },
        min_price: { type: 'number' },
        max_price: { type: 'number' },
        warranty_policy: { type: 'boolean' },
        status: { type: 'string', enum: ['IN_STOCK', 'OUT_OF_STOCK'] },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sản phẩm đã được tạo thành công'
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Description('Tạo mới sản phẩm', [
    { status: 201, description: 'Sản phẩm đã được tạo thành công' }
  ])
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @Post('upload-image/:id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiOperation({
    summary: 'Upload ảnh cho sản phẩm',
    description: 'Upload hoặc cập nhật ảnh cho sản phẩm sử dụng Cloudinary'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID của sản phẩm' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ảnh sản phẩm đã được cập nhật thành công'
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  @Description('Upload ảnh cho sản phẩm', [
    { status: 200, description: 'Ảnh sản phẩm đã được cập nhật thành công' }
  ])
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.productsService.updateProductImage(id, file);
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
    return products;
  }

  @Get('search/by-category-name')
  @ApiOperation({
    summary: 'Tìm sản phẩm theo tên danh mục',
    description: 'Tìm kiếm sản phẩm dựa trên tên của danh mục'
  })
  @ApiQuery({
    name: 'categoryName',
    required: true,
    type: String,
    description: 'Tên danh mục cần tìm'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm theo danh mục'
  })
  @Description('Tìm sản phẩm theo tên danh mục', [
    { status: 200, description: 'Danh sách sản phẩm theo danh mục' },
    { status: 404, description: 'Không tìm thấy danh mục' }
  ])
  findByCategoryName(@Query('categoryName') categoryName: string) {
    return this.productsService.findByCategoryName(categoryName);
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
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiOperation({
    summary: 'Cập nhật sản phẩm',
    description: 'Cập nhật thông tin sản phẩm với ID cụ thể'
  })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        id_category: { type: 'string' },
        id_discount: { type: 'string' },
        id_inventory: { type: 'string' },
        base_price: { type: 'number' },
        min_price: { type: 'number' },
        max_price: { type: 'number' },
        warranty_policy: { type: 'boolean' },
        status: { type: 'string', enum: ['IN_STOCK', 'OUT_OF_STOCK'] },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sản phẩm đã được cập nhật thành công'
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  @Description('Cập nhật sản phẩm', [
    { status: 200, description: 'Product updated' }
  ])
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
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
