/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MessengeCode } from '../common/exception/MessengeCode';
import { CategoryModel } from './model/category.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
      type: createCategoryDto.type
    });

    if (existingCategory) {
      throw MessengeCode.CATEGORY.ALREADY_EXISTS;
    }

    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findByType(type: string): Promise<Category[]> {
    return this.categoryModel.find({ type }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findById(new Types.ObjectId(id))
      .exec();
    if (!category) {
      throw MessengeCode.CATEGORY.NOT_FOUND;
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateCategoryDto, {
        new: true
      })
      .exec();

    if (!updatedCategory) {
      throw MessengeCode.CATEGORY.NOT_FOUND;
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<Category> {
    console.log('id', id);
    
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedCategory) {
      throw MessengeCode.CATEGORY.NOT_FOUND;
    }

    return CategoryModel.fromEntity(deletedCategory);
  }
}
