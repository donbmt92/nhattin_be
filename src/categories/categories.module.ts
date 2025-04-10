/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepo } from './categories.repo';
import { CloudinaryService } from '../upload/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema }
    ])
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepo, CloudinaryService],
  exports: [CategoriesService]
})
export class CategoriesModule {} 