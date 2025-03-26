import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepo } from './users.repo';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepo],
  exports: [UsersService, UsersRepo],
})
export class UsersModule {}
