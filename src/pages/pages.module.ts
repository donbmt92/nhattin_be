import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './schemas/page.schema';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
    UsersModule
  ],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService]
})
export class PagesModule {} 