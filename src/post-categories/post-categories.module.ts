import { Module } from '@nestjs/common';
import { PostCategoriesService } from './post-categories.service';
import { PostCategoriesController } from './post-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostCategory, PostCategorySchema } from './schemas/post-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostCategory.name, schema: PostCategorySchema }
    ])
  ],
  controllers: [PostCategoriesController],
  providers: [PostCategoriesService],
  exports: [PostCategoriesService],
})
export class PostCategoriesModule {} 