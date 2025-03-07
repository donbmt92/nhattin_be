/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Discount, DiscountDocument } from './schemas/discount.schema';
import { MessengeCode } from '../common/exception/MessengeCode';
import { CreateDiscountDto } from './dto/create-discount.dto/create-discount.dto';
import { DiscountModel } from './model/discout.model';
import { UpdateDiscountDto } from './dto/update-discount.dto/update-discount.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<DiscountModel> {
    try {
      const existingDiscount = await this.discountModel.findOne({
        name: createDiscountDto.name
      });

      if (existingDiscount) {
        throw MessengeCode.DISCOUNT.ALREADY_EXISTS;
      }

      console.log('createDiscountDto', createDiscountDto);

      const createdDiscount = new this.discountModel(createDiscountDto);
      console.log('createdDiscount', createdDiscount);
      const savedDiscount = await createdDiscount.save();
      console.log('savedDiscount', savedDiscount);
      return DiscountModel.fromEntity(savedDiscount);
    } catch (error) {
      if (error === MessengeCode.DISCOUNT.ALREADY_EXISTS) {
        throw new BadRequestException('Khuyến mãi đã tồn tại');
      }
      console.error('Error creating discount:', error);
      throw new BadRequestException('Không thể tạo khuyến mãi: ' + error.message);
    }
  }

  async findAll(): Promise<DiscountModel[]> {
    const discounts = await this.discountModel.find().exec();
    return DiscountModel.fromEntities(discounts);
  }

  async findActive(): Promise<DiscountModel[]> {
    const now = new Date();
    const discounts = await this.discountModel
      .find({
        status: 'active',
        time_start: { $lte: now },
        time_end: { $gte: now }
      })
      .exec();
    return DiscountModel.fromEntities(discounts);
  }

  async findOne(id: string): Promise<DiscountModel> {
    const discount = await this.discountModel
      .findById(new Types.ObjectId(id))
      .exec();
    if (!discount) {
      throw MessengeCode.DISCOUNT.NOT_FOUND;
    }
    return DiscountModel.fromEntity(discount);
  }

  async update(
    id: string,
    updateDiscountDto: UpdateDiscountDto
  ): Promise<DiscountModel> {
    const updatedDiscount = await this.discountModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateDiscountDto, {
        new: true
      })
      .exec();

    if (!updatedDiscount) {
      throw MessengeCode.DISCOUNT.NOT_FOUND;
    }

    return DiscountModel.fromEntity(updatedDiscount);
  }

  async remove(id: string): Promise<DiscountModel> {
    const deletedDiscount = await this.discountModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .lean()
      .exec();

    if (!deletedDiscount) {
      throw MessengeCode.DISCOUNT.NOT_FOUND;
    }

    return DiscountModel.fromEntity(deletedDiscount as DiscountDocument);
  }
}
