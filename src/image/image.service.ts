import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Image, ImageDocument } from './schemas/image.schema';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private readonly uploadService: UploadService,
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

  async uploadFile(file: Express.Multer.File) {
    // Upload và optimize ảnh
    const uploadResult = await this.uploadService.uploadImage(file);

    // Lưu thông tin vào database
    const imageData = {
      name: uploadResult.originalName,
      fileName: uploadResult.fileName,
      path: uploadResult.filePath,
      thumbnailPath: uploadResult.thumbnailPath,
      size: uploadResult.fileSize,
      type: uploadResult.mimeType,
    };

    const createdImage = new this.imageModel(imageData);
    return createdImage.save();
  }
} 