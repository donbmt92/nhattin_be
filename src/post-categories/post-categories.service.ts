import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostCategory, PostCategoryDocument } from './schemas/post-category.schema';

@Injectable()
export class PostCategoriesService {
  constructor(
    @InjectModel(PostCategory.name)
    private readonly postCategoryModel: Model<PostCategoryDocument>,
  ) {}

  async create(createPostCategoryDto: CreatePostCategoryDto) {
    const category = new this.postCategoryModel(createPostCategoryDto);
    return await category.save();
  }

  async findAll() {
    return await this.postCategoryModel.find({ isActive: true }).exec();
  }

  async findOne(id: string) {
    const category = await this.postCategoryModel.findOne({ _id: id, isActive: true }).exec();

    if (!category) {
      throw new NotFoundException(`Post category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updatePostCategoryDto: UpdatePostCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, updatePostCategoryDto);
    return await category.save();
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    category.isActive = false;
    return await category.save();
  }
} 