import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

interface UploadResult {
  originalName: string;
  fileName: string;
  filePath: string;
  thumbnailPath?: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
}

@Injectable()
export class UploadService {
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  private validateFile(
    file: Express.Multer.File,
    options?: {
      allowedTypes?: string[];
      maxSize?: number;
    },
  ): void {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    const allowedTypes = options?.allowedTypes || this.allowedImageTypes;
    const maxSize = options?.maxSize || this.maxFileSize;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Loại file không được hỗ trợ');
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB`,
      );
    }
  }

  private async createDirectory(folder: string): Promise<string> {
    const uploadDir = path.join('uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  private generateFileName(file: Express.Multer.File): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    return `${uniqueSuffix}${ext}`;
  }

  async saveFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    options?: {
      allowedTypes?: string[];
      maxSize?: number;
      generateThumbnail?: boolean;
      resize?: { width?: number; height?: number };
      quality?: number;
    },
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file, {
        allowedTypes: options?.allowedTypes,
        maxSize: options?.maxSize,
      });

      // Create directory
      const uploadDir = await this.createDirectory(folder);

      // Generate filenames
      const fileName = this.generateFileName(file);
      const filePath = path.join(uploadDir, fileName);

      let width: number;
      let height: number;

      // Process image if it's an image file
      if (this.allowedImageTypes.includes(file.mimetype)) {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();

        // Resize if specified
        if (options?.resize) {
          const { width: targetWidth, height: targetHeight } = options.resize;
          await image
            .resize(targetWidth, targetHeight, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: options?.quality || 80 })
            .toFile(filePath);

          const resizedMetadata = await sharp(filePath).metadata();
          width = resizedMetadata.width;
          height = resizedMetadata.height;
        } else {
          // Save original with compression
          await image
            .jpeg({ quality: options?.quality || 80 })
            .toFile(filePath);
          width = metadata.width;
          height = metadata.height;
        }

        // Generate thumbnail if requested
        let thumbnailPath: string;
        if (options?.generateThumbnail) {
          const thumbFileName = `thumb_${fileName}`;
          thumbnailPath = path.join(uploadDir, thumbFileName);
          await image
            .resize(300, 300, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({ quality: 70 })
            .toFile(thumbnailPath);
          thumbnailPath = thumbnailPath.replace(/\\/g, '/');
        }

        return {
          originalName: file.originalname,
          fileName,
          filePath: filePath.replace(/\\/g, '/'),
          thumbnailPath,
          fileSize: file.size,
          mimeType: file.mimetype,
          width,
          height,
        };
      }

      // For non-image files
      fs.writeFileSync(filePath, file.buffer);
      return {
        originalName: file.originalname,
        fileName,
        filePath: filePath.replace(/\\/g, '/'),
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException('Không thể lưu file: ' + error.message);
    }
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);

        // Delete thumbnail if exists
        const dir = path.dirname(filepath);
        const filename = path.basename(filepath);
        const thumbnailPath = path.join(dir, `thumb_${filename}`);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
    } catch (error) {
      throw new BadRequestException('Không thể xóa file: ' + error.message);
    }
  }

  async updateFile(
    oldFilepath: string,
    newFile: Express.Multer.File,
    folder: string = 'uploads',
    options?: {
      allowedTypes?: string[];
      maxSize?: number;
      generateThumbnail?: boolean;
      resize?: { width?: number; height?: number };
      quality?: number;
    },
  ): Promise<UploadResult> {
    try {
      // Delete old file
      await this.deleteFile(oldFilepath);

      // Save new file
      return await this.saveFile(newFile, folder, options);
    } catch (error) {
      throw new BadRequestException(
        'Không thể cập nhật file: ' + error.message,
      );
    }
  }
}
