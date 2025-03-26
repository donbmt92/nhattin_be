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
    
    const post = await this.postModel.create({
      ...createPostDto,
      category: category._id,
      author: "678f537fe84a347682865f17"
    });

    return post;
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