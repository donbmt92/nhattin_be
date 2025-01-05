import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Navigation, NavigationSchema } from './schemas/navigation.schema';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { PagesModule } from '../pages/pages.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Navigation.name, schema: NavigationSchema }]),
    PagesModule,
    UsersModule
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService]
})
export class NavigationModule {} 