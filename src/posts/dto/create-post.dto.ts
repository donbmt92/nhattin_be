import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  slug?: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;
}  