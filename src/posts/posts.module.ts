import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostCategoriesModule } from '../post-categories/post-categories.module';
import { CloudinaryService } from '../upload/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema }
    ]),
    PostCategoriesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, CloudinaryService],
  exports: [PostsService],
})
export class PostsModule {} 