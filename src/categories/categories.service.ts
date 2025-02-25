/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepo } from './categories.repo';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryModel } from './models/category.model';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepo) {}

  async findAll(): Promise<CategoryModel[]> {
    const categories = await this.categoriesRepo.findAll();
    return categories.map(category => CategoryModel.fromEntity(category));
  }

  async findById(id: string): Promise<CategoryModel> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return CategoryModel.fromEntity(category);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryModel> {
    const newCategory = await this.categoriesRepo.create(createCategoryDto);
    return CategoryModel.fromEntity(newCategory);
  }

  async update(id: string, updateCategoryDto: Partial<CreateCategoryDto>): Promise<CategoryModel> {
    const existingCategory = await this.categoriesRepo.findById(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    const updatedCategory = await this.categoriesRepo.update(id, updateCategoryDto);
    return CategoryModel.fromEntity(updatedCategory);
  }

  async delete(id: string): Promise<void> {
    const existingCategory = await this.categoriesRepo.findById(id);
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    await this.categoriesRepo.delete(id);
  }
} 