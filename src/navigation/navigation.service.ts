import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Navigation, NavigationDocument } from './schemas/navigation.schema';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { NavigationModel } from './model/navigation.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { PagesService } from '../pages/pages.service';

@Injectable()
export class NavigationService {
  constructor(
    @InjectModel(Navigation.name) private navigationModel: Model<NavigationDocument>,
    private readonly pagesService: PagesService,
  ) {}

  async create(createNavigationDto: CreateNavigationDto): Promise<NavigationModel> {
    // Kiểm tra page tồn tại
    await this.pagesService.findOne(createNavigationDto.id_page);

    const existingNavigation = await this.navigationModel.findOne({
      name: createNavigationDto.name,
      id_page: new Types.ObjectId(createNavigationDto.id_page),
    });

    if (existingNavigation) {
      throw MessengeCode.NAVIGATION.ALREADY_EXISTS;
    }

    const createdNavigation = new this.navigationModel({
      ...createNavigationDto,
      id_page: new Types.ObjectId(createNavigationDto.id_page),
    });

    const savedNavigation = await createdNavigation.save();
    return NavigationModel.fromEntity(savedNavigation);
  }

  async findAll(): Promise<NavigationModel[]> {
    const navigations = await this.navigationModel
      .find()
      .populate('id_page')
      .sort({ position: 1 })
      .exec();
    return NavigationModel.fromEntities(navigations);
  }

  async findByPage(pageId: string): Promise<NavigationModel[]> {
    const navigations = await this.navigationModel
      .find({ id_page: new Types.ObjectId(pageId) })
      .sort({ position: 1 })
      .exec();
    return NavigationModel.fromEntities(navigations);
  }

  async findOne(id: string): Promise<NavigationModel> {
    const navigation = await this.navigationModel
      .findById(new Types.ObjectId(id))
      .populate('id_page')
      .exec();

    if (!navigation) {
      throw MessengeCode.NAVIGATION.NOT_FOUND;
    }

    return NavigationModel.fromEntity(navigation);
  }

  async update(id: string, updateNavigationDto: UpdateNavigationDto): Promise<NavigationModel> {
    if (updateNavigationDto.id_page) {
      await this.pagesService.findOne(updateNavigationDto.id_page);
    }

    const updatedNavigation = await this.navigationModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          ...updateNavigationDto,
          id_page: updateNavigationDto.id_page 
            ? new Types.ObjectId(updateNavigationDto.id_page)
            : undefined,
        },
        { new: true }
      )
      .exec();

    if (!updatedNavigation) {
      throw MessengeCode.NAVIGATION.NOT_FOUND;
    }

    return NavigationModel.fromEntity(updatedNavigation);
  }

  async remove(id: string): Promise<NavigationModel> {
    const deletedNavigation = await this.navigationModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedNavigation) {
      throw MessengeCode.NAVIGATION.NOT_FOUND;
    }

    return NavigationModel.fromEntity(deletedNavigation);
  }
} 