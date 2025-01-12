import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { RolesGuard } from '../auth/guard/role.guard';
import { Control } from '../common/meta/control.meta';
import { Description } from '../common/meta/description.meta';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Control('images')
@UseGuards(RolesGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @Description('Tải lên hình ảnh', [
    { status: 201, description: 'Tải lên thành công' },
  ])
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.imageService.uploadFile(file);
  }

  @Post()
  @Description('Tạo mới hình ảnh', [
    { status: 201, description: 'Tạo thành công' },
  ])
  create(@Body() createImageDto: CreateImageDto) {
    return this.imageService.create(createImageDto);
  }

  @Get()
  @Description('Lấy danh sách hình ảnh', [
    { status: 200, description: 'Thành công' },
  ])
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  @Description('Lấy thông tin hình ảnh', [
    { status: 200, description: 'Thành công' },
  ])
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Put(':id')
  @Description('Cập nhật hình ảnh', [
    { status: 200, description: 'Cập nhật thành công' },
  ])
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imageService.update(id, updateImageDto);
  }

  @Delete(':id')
  @Description('Xóa hình ảnh', [{ status: 200, description: 'Xóa thành công' }])
  remove(@Param('id') id: string) {
    return this.imageService.remove(id);
  }
}
