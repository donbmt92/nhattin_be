import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image, ImageSchema } from './schemas/image.schema';
import { UploadModule } from '../upload/upload.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    UploadModule,
    UsersModule,
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {} 