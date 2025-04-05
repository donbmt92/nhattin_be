import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { PostCategoriesService } from '../post-categories/post-categories.service';
import { CloudinaryService } from '../upload/cloudinary.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly postCategoriesService: PostCategoriesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return await this.cloudinaryService.uploadImage(file, 'posts');
  }

  async create(createPostDto: CreatePostDto) {
    const category = await this.postCategoriesService.findOne(createPostDto.categoryId);
    
    // If no slug is provided, generate one from the title
    if (!createPostDto.slug) {
      createPostDto.slug = this.generateSlug(createPostDto.title);
    }
    
    // Check if slug already exists and make it unique if needed
    createPostDto.slug = await this.ensureUniqueSlug(createPostDto.slug);
    
    const post = await this.postModel.create({
      ...createPostDto,
      category: category._id,
      author: "678f537fe84a347682865f17" // Consider making this dynamic based on logged-in user
    });

    return post;
  }

  // Generate a slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
  }

  // Ensure slug is unique
  private async ensureUniqueSlug(slug: string): Promise<string> {
    const existingPost = await this.postModel.findOne({ slug });
    if (!existingPost) {
      return slug;
    }

    // If slug exists, append a number to make it unique
    let count = 1;
    let newSlug = `${slug}-${count}`;
    
    while (await this.postModel.findOne({ slug: newSlug })) {
      count++;
      newSlug = `${slug}-${count}`;
    }

    return newSlug;
  }

  async findAll() {
    return await this.postModel
      .find({ isActive: true })
      .populate('category')
      .populate('author')
      .exec();
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findOne({ _id: id, isActive: true })
      .populate('category')
      .populate('author')
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.postModel
      .findOne({ slug, isActive: true })
      .populate('category')
      .populate('author')
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Update view count
    await this.postModel.updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const existingPost = await this.findOne(id);

    if (updatePostDto.categoryId) {
      const category = await this.postCategoriesService.findOne(updatePostDto.categoryId);
      await this.postModel.updateOne(
        { _id: id },
        { $set: { category: category._id } }
      );
      delete updatePostDto.categoryId;
    }

    // If there's a new thumbnail and the post already has one, delete the old one
    if (updatePostDto.thumbnail && existingPost.thumbnail) {
      const publicId = this.cloudinaryService.getPublicIdFromUrl(existingPost.thumbnail);
      await this.cloudinaryService.deleteImage(publicId);
    }

    return await this.postModel.findByIdAndUpdate(
      id,
      { $set: updatePostDto },
      { new: true }
    ).populate('category').populate('author');
  }

  async remove(id: string) {
    return await this.postModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async findByCategory(categoryId: string) {
    return await this.postModel
      .find({ category: categoryId, isActive: true })
      .populate('category')
      .populate('author')
      .exec();
  }
} 