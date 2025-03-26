import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostCategoriesService } from './post-categories.service';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';

@Controller('post-categories')
export class PostCategoriesController {
  constructor(private readonly postCategoriesService: PostCategoriesService) {}

  @Post()
  create(@Body() createPostCategoryDto: CreatePostCategoryDto) {
    return this.postCategoriesService.create(createPostCategoryDto);
  }

  @Get()
  findAll() {
    return this.postCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostCategoryDto: UpdatePostCategoryDto) {
    return this.postCategoriesService.update(id, updatePostCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postCategoriesService.remove(id);
  }
} 