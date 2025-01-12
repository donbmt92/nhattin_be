/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Image, ImageDocument } from './schemas/image.schema';
import { CreateImageDto } from './dto/create-image.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async create(createImageDto: CreateImageDto, file: Express.Multer.File): Promise<Image> {
    try {
      if (!file) {
        throw new BadRequestException('File ảnh là bắt buộc');
      }

      // Upload and process image
      const uploadResult = await this.uploadService.saveFile(file, createImageDto.type, {
        generateThumbnail: true,
        resize: { width: 1200 }, // Max width for high quality
        quality: 85
      });

      // Create image record with metadata
      const imageData = {
        type: createImageDto.type,
        link: uploadResult.filePath,
        thumbnail: uploadResult.thumbnailPath,
        fileName: uploadResult.fileName,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.fileSize,
        width: uploadResult.width,
        height: uploadResult.height
      };

      const createdImage = new this.imageModel(imageData);
      return await createdImage.save();
    } catch (error) {
      throw new BadRequestException('Không thể tạo hình ảnh: ' + error.message);
    }
  }

  async findAll(type?: string): Promise<Image[]> {
    try {
      const query = type ? { type } : {};
      return await this.imageModel.find(query).lean().exec();
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách hình ảnh: ' + error.message);
    }
  }

  async findOne(id: string): Promise<Image> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('ID hình ảnh không hợp lệ');
      }

      const image = await this.imageModel.findById(new Types.ObjectId(id)).lean().exec();
      if (!image) {
        throw new BadRequestException('Không tìm thấy hình ảnh');
      }
      return image;
    } catch (error) {
      throw new BadRequestException('Không thể tìm hình ảnh: ' + error.message);
    }
  }

  async remove(id: string): Promise<Image> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException('ID hình ảnh không hợp lệ');
      }

      const image = await this.imageModel.findById(new Types.ObjectId(id)).lean().exec();
      if (!image) {
        throw new BadRequestException('Không tìm thấy hình ảnh');
      }

      // Delete physical files
      await this.uploadService.deleteFile(image.link);
      if (image.thumbnail) {
        await this.uploadService.deleteFile(image.thumbnail);
      }

      // Delete database record
      const deletedImage = await this.imageModel
        .findByIdAndDelete(new Types.ObjectId(id))
        .lean()
        .exec();

      if (!deletedImage) {
        throw new BadRequestException('Không tìm thấy hình ảnh để xóa');
      }

      return deletedImage;
    } catch (error) {
      throw new BadRequestException('Không thể xóa hình ảnh: ' + error.message);
    }
  }
}
