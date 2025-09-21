import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Affiliate, AffiliateDocument } from './schemas/affiliate.schema';
import { ICreateAffiliate, IUpdateAffiliate } from './model/affiliate.model';

@Injectable()
export class AffiliateRepo {
  constructor(
    @InjectModel(Affiliate.name) private affiliateModel: Model<AffiliateDocument>
  ) {}

  async create(createAffiliateDto: ICreateAffiliate): Promise<AffiliateDocument> {
    const affiliate = new this.affiliateModel(createAffiliateDto);
    return affiliate.save();
  }

  async findById(id: string): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findOne({ userId }).exec();
  }

  async findByCode(affiliateCode: string): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findOne({ affiliateCode }).exec();
  }

  async update(id: string, updateAffiliateDto: IUpdateAffiliate): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findByIdAndUpdate(id, updateAffiliateDto, { new: true }).exec();
  }

  async updateEarnings(id: string, commission: number): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findByIdAndUpdate(
      id,
      { $inc: { totalEarnings: commission } },
      { new: true }
    ).exec();
  }

  async incrementReferrals(id: string): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findByIdAndUpdate(
      id,
      { $inc: { totalReferrals: 1 } },
      { new: true }
    ).exec();
  }

  async incrementApprovedReferrals(id: string): Promise<AffiliateDocument | null> {
    return this.affiliateModel.findByIdAndUpdate(
      id,
      { $inc: { approvedReferrals: 1 } },
      { new: true }
    ).exec();
  }

  async findAll(query: any = {}, skip: number = 0, limit: number = 10): Promise<AffiliateDocument[]> {
    return this.affiliateModel.find(query).skip(skip).limit(limit).exec();
  }

  async count(query: any = {}): Promise<number> {
    return this.affiliateModel.countDocuments(query).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.affiliateModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
