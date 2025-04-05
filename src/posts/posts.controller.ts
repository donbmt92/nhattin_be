import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
// import { Roles } from 'src/common/meta/role.meta';
// import { Role } from 'src/users/enum/role.enum';
// import { RolesGuard } from 'src/auth/guard/role.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        categoryId: { type: 'string' },
        slug: { type: 'string' },
        thumbnail: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The post has been successfully created.' })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(@Body() createPostDto: CreatePostDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      const thumbnailUrl = await this.postsService.uploadImage(file);
      createPostDto.thumbnail = thumbnailUrl;
    }
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter posts by category ID' })
  @ApiResponse({ status: 200, description: 'Return all posts' })
  findAll(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      return this.postsService.findByCategory(categoryId);
    }
    return this.postsService.findAll();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get posts by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Return posts by category' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.postsService.findByCategory(categoryId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get post by slug' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @ApiResponse({ status: 200, description: 'Return the post with the matching slug' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Return the post with the matching ID' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        categoryId: { type: 'string' },
        slug: { type: 'string' },
        thumbnail: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The post has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Post not found' })
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
  @ApiOperation({ summary: 'Remove a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'The post has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
} 