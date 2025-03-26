import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;
} 