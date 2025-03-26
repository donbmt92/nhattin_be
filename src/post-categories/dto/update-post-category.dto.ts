import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCategoryDto } from './create-post-category.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePostCategoryDto extends PartialType(CreatePostCategoryDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 