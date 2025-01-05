import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Image, ImageDocument } from './schemas/image.schema';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    const createdImage = new this.imageModel(createImageDto);
    return createdImage.save();
  }

  async findAll(): Promise<Image[]> {
    return this.imageModel.find().exec();
  }

  async findOne(id: string): Promise<Image> {
    return this.imageModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    return this.imageModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateImageDto, { new: true })
      .lean()
      .exec();
  }

  async remove(id: string): Promise<Image> {
    return this.imageModel.findByIdAndDelete(new Types.ObjectId(id)).lean().exec();
  }
} 