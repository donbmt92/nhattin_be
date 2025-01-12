import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Lưu file trong memory để xử lý trước khi lưu xuống disk
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {} 