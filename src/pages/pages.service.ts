import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageModel } from './model/page.model';
import { MessengeCode } from '../common/exception/MessengeCode';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<PageModel> {
    const existingPage = await this.pageModel.findOne({
      $or: [
        { name: createPageDto.name },
        { link: createPageDto.link }
      ]
    });

    if (existingPage) {
      throw MessengeCode.PAGE.ALREADY_EXISTS;
    }

    const createdPage = new this.pageModel(createPageDto);
    const savedPage = await createdPage.save();
    return PageModel.fromEntity(savedPage);
  }

  async findAll(): Promise<PageModel[]> {
    const pages = await this.pageModel.find().exec();
    return PageModel.fromEntities(pages);
  }

  async findOne(id: string): Promise<PageModel> {
    const page = await this.pageModel
      .findById(new Types.ObjectId(id))
      .exec();

    if (!page) {
      throw MessengeCode.PAGE.NOT_FOUND;
    }

    return PageModel.fromEntity(page);
  }

  async update(id: string, updatePageDto: UpdatePageDto): Promise<PageModel> {
    if (updatePageDto.name || updatePageDto.link) {
      const existingPage = await this.pageModel.findOne({
        _id: { $ne: new Types.ObjectId(id) },
        $or: [
          { name: updatePageDto.name },
          { link: updatePageDto.link }
        ]
      });

      if (existingPage) {
        throw MessengeCode.PAGE.ALREADY_EXISTS;
      }
    }

    const updatedPage = await this.pageModel
      .findByIdAndUpdate(new Types.ObjectId(id), updatePageDto, { new: true })
      .exec();

    if (!updatedPage) {
      throw MessengeCode.PAGE.NOT_FOUND;
    }

    return PageModel.fromEntity(updatedPage);
  }

  async remove(id: string): Promise<PageModel> {
    const deletedPage = await this.pageModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedPage) {
      throw MessengeCode.PAGE.NOT_FOUND;
    }

    return PageModel.fromEntity(deletedPage);
  }
} 