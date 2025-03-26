import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from './cloudinary.config';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    
    this.logger.log(`Cloudinary Config - Cloud Name: ${cloudName}, API Key: ${apiKey ? 'Set' : 'Not Set'}, API Secret: ${apiSecret ? 'Set' : 'Not Set'}`);
    
    const config: CloudinaryConfig = {
      cloud_name: cloudName || 'db7oq4fop',
      api_key: apiKey || '381914899672568',
      api_secret: apiSecret || 'v-Q4IK-xrFNmchrbn1eXF3PNbro',
    };
    
    this.logger.log('Configuring Cloudinary with the following config:');
    this.logger.log(`cloud_name: ${config.cloud_name}`);
    this.logger.log(`api_key: ${config.api_key ? 'provided' : 'missing'}`);
    this.logger.log(`api_secret: ${config.api_secret ? 'provided' : 'missing'}`);
    
    cloudinary.config(config);
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'users'): Promise<string> {
    try {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: folder,
        resource_type: 'auto',
      });

      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
  }

  getPublicIdFromUrl(url: string): string {
    const splitUrl = url.split('/');
    const filename = splitUrl[splitUrl.length - 1];
    return filename.split('.')[0];
  }
} 