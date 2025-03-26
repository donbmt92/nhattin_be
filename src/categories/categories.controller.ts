/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryModel } from './models/category.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enum/role.enum';
import { CloudinaryService } from '../upload/cloudinary.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục', type: [CategoryModel] })
  async findAll(): Promise<CategoryModel[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin danh mục theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin danh mục', type: CategoryModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async findById(@Param('id') id: string): Promise<CategoryModel> {
    return this.categoriesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        image: { type: 'string', format: 'binary' }
      },
      required: ['name', 'type']
    }
  })
  @ApiResponse({ status: 201, description: 'Danh mục đã được tạo', type: CategoryModel })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('status') status?: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/i }),
        ],
        fileIsRequired: false,
      }),
    ) file?: Express.Multer.File
  ): Promise<CategoryModel> {
    const createCategoryDto: CreateCategoryDto = {
      name,
      type,
      status: status as any
    };
    
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file, 'categories');
    }
    
    return this.categoriesService.create({ ...createCategoryDto, image: imageUrl });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin danh mục' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        image: { type: 'string', format: 'binary' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Danh mục đã được cập nhật', type: CategoryModel })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('type') type?: string,
    @Body('status') status?: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/i }),
        ],
        fileIsRequired: false,
      }),
    ) file?: Express.Multer.File
  ): Promise<CategoryModel> {
    const updateCategoryDto: Partial<CreateCategoryDto> = {};
    if (name) updateCategoryDto.name = name;
    if (type) updateCategoryDto.type = type;
    if (status) updateCategoryDto.status = status as any;
    console.log(updateCategoryDto, file);
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file, 'categories');
      updateCategoryDto.image = imageUrl;
    }
    
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.categoriesService.delete(id);
  }
} 