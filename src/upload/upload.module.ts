import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Lưu file trong memory để xử lý trước khi lưu xuống disk
    }),
    ConfigModule,
  ],
  providers: [UploadService, CloudinaryService],
  exports: [UploadService, CloudinaryService],
})
export class UploadModule {} 