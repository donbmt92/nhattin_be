import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Image } from './schemas/image.schema';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image upload with type',
    type: CreateImageDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: Image,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size',
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createImageDto: CreateImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imageService.create(createImageDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter images by type',
    enum: ['product', 'category', 'banner', 'avatar'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of images retrieved successfully',
    type: [Image],
  })
  findAll(@Query('type') type?: string) {
    return this.imageService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiParam({
    name: 'id',
    description: 'Image ID',
    example: '65f2d6e8c35e6c34f4112345',
  })
  @ApiResponse({
    status: 200,
    description: 'Image found',
    type: Image,
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete image by ID' })
  @ApiParam({
    name: 'id',
    description: 'Image ID',
    example: '65f2d6e8c35e6c34f4112345',
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  remove(@Param('id') id: string) {
    return this.imageService.remove(id);
  }
}
