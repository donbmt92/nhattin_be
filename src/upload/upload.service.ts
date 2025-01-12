import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import * as sharp from 'sharp';

type MulterFile = Express.Multer.File;

@Injectable()
export class UploadService {
  private readonly uploadDir = './uploads';
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor() {
    // Tạo thư mục uploads nếu chưa tồn tại
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(file: MulterFile) {
    try {
      // Validate file
      await this.validateFile(file);

      // Tạo tên file unique
      const fileName = this.generateFileName(file);
      const filePath = `${this.uploadDir}/${fileName}`;

      // Optimize và lưu ảnh
      await this.optimizeAndSaveImage(file.buffer, filePath);

      // Tạo thumbnail
      const thumbnailPath = `${this.uploadDir}/thumb_${fileName}`;
      await this.createThumbnail(file.buffer, thumbnailPath);

      return {
        originalName: file.originalname,
        fileName: fileName,
        filePath: filePath.replace('./', ''),
        thumbnailPath: thumbnailPath.replace('./', ''),
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  private async validateFile(file: MulterFile) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only images are allowed');
    }

    if (file.size > this.maxFileSize) {
      throw new Error('File size too large. Maximum size is 5MB');
    }
  }

  private generateFileName(file: MulterFile): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = extname(file.originalname);
    return `${timestamp}-${randomString}${ext}`;
  }

  private async optimizeAndSaveImage(buffer: Buffer, filePath: string) {
    await sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(filePath);
  }

  private async createThumbnail(buffer: Buffer, thumbnailPath: string) {
    await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);
  }
}
