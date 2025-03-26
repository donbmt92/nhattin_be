import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
// import { Roles } from 'src/common/meta/role.meta';
// import { Role } from 'src/users/enum/role.enum';
// import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(@Body() createPostDto: CreatePostDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      const thumbnailUrl = await this.postsService.uploadImage(file);
      createPostDto.thumbnail = thumbnailUrl;
    }
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.postsService.findByCategory(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @Param('id') id: string, 
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      const thumbnailUrl = await this.postsService.uploadImage(file);
      updatePostDto.thumbnail = thumbnailUrl;
    }
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
} 