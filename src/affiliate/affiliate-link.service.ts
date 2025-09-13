import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AffiliateLink, AffiliateLinkDocument } from './schemas/affiliate-link.schema';
import { Affiliate, AffiliateDocument } from './schemas/affiliate.schema';
import { ICreateAffiliateLink, IAffiliateLinkStats } from './model/affiliate-link.model';
import { AffiliateRepo } from './affiliate.repo';
import * as crypto from 'crypto';

@Injectable()
export class AffiliateLinkService {
  constructor(
    @InjectModel(AffiliateLink.name) private affiliateLinkModel: Model<AffiliateLinkDocument>,
    @InjectModel(Affiliate.name) private affiliateModel: Model<AffiliateDocument>,
    @InjectModel('Product') private productModel: Model<any>,
    private readonly affiliateRepo: AffiliateRepo
  ) {}

  private generateLinkCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  private generateShortUrl(linkCode: string): string {
    // Trong thực tế, bạn có thể sử dụng domain riêng hoặc service rút gọn link
    return `${process.env.BASE_URL || 'http://localhost:3000'}/affiliate/redirect/${linkCode}`;
  }

  async createAffiliateLink(
    affiliateId: string, 
    createLinkDto: ICreateAffiliateLink
  ): Promise<AffiliateLinkDocument> {
    // Kiểm tra affiliate có tồn tại và active không
    console.log('🔍 Looking for affiliate with ID:', affiliateId);
    const affiliate = await this.affiliateRepo.findById(affiliateId);
    console.log('🔍 Found affiliate:', affiliate ? `${affiliate._id} - ${affiliate.status}` : 'null');
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      throw new BadRequestException('Affiliate không tồn tại hoặc không active');
    }

    // Kiểm tra thời gian hết hạn
    if (new Date(createLinkDto.expiresAt) <= new Date()) {
      throw new BadRequestException('Thời gian hết hạn phải lớn hơn thời gian hiện tại');
    }

    // Tạo link code unique
    let linkCode: string;
    let isUnique = false;
    let attempts = 0;
    
    do {
      linkCode = this.generateLinkCode();
      const existingLink = await this.affiliateLinkModel.findOne({ linkCode });
      isUnique = !existingLink;
      attempts++;
      
      if (attempts > 10) {
        throw new BadRequestException('Không thể tạo link code unique');
      }
    } while (!isUnique);

    // Lấy thông tin sản phẩm để tạo URL với slug
    const product = await this.productModel.findById(createLinkDto.productId);
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    // Tạo URL gốc với product slug
    const productSlug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-') || createLinkDto.productId;
    const originalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${productSlug}`;
    const shortUrl = this.generateShortUrl(linkCode);

    const affiliateLink = new this.affiliateLinkModel({
      affiliateId,
      productId: createLinkDto.productId,
      linkCode,
      originalUrl,
      shortUrl,
      expiresAt: createLinkDto.expiresAt,
      campaignName: createLinkDto.campaignName,
      notes: createLinkDto.notes
    });

    return await affiliateLink.save();
  }

  async getAffiliateLink(linkCode: string): Promise<AffiliateLinkDocument> {
    const link = await this.affiliateLinkModel.findOne({ linkCode });
    if (!link) {
      throw new NotFoundException('Link affiliate không tồn tại');
    }

    // Kiểm tra link có hết hạn không
    if (new Date() > link.expiresAt) {
      link.status = 'EXPIRED';
      await link.save();
      throw new BadRequestException('Link affiliate đã hết hạn');
    }

    if (link.status !== 'ACTIVE') {
      throw new BadRequestException('Link affiliate không khả dụng');
    }

    return link;
  }

  async trackClick(linkCode: string, userIP: string): Promise<AffiliateLinkDocument> {
    const link = await this.getAffiliateLink(linkCode);
    
    // Tăng click count
    link.clickCount += 1;
    
    // Thêm IP vào danh sách (giới hạn để tránh spam)
    if (!link.clickedByIPs.includes(userIP) && link.clickedByIPs.length < 1000) {
      link.clickedByIPs.push(userIP);
    }
    
    return await link.save();
  }

  async trackConversion(linkCode: string, userId: string, orderValue: number): Promise<AffiliateLinkDocument> {
    const link = await this.getAffiliateLink(linkCode);
    
    // Lấy thông tin affiliate để tính hoa hồng
    const affiliate = await this.affiliateRepo.findById(link.affiliateId.toString());
    if (!affiliate) {
      throw new NotFoundException('Affiliate không tồn tại');
    }

    // Tính hoa hồng
    const commission = (orderValue * affiliate.commissionRate) / 100;
    
    // Cập nhật link
    link.conversionCount += 1;
    link.totalCommissionEarned += commission;
    
    // Thêm user vào danh sách đã convert
    if (!link.convertedUserIds.includes(userId)) {
      link.convertedUserIds.push(userId);
    }
    
    return await link.save();
  }

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLinkDocument[]> {
    return await this.affiliateLinkModel
      .find({ affiliateId })
      .sort({ createdAt: -1 })
      .populate('productId', 'name price images')
      .exec();
  }

  async getAllLinks(): Promise<AffiliateLinkDocument[]> {
    return this.affiliateLinkModel.find({}).exec();
  }

  async getAffiliateLinkStats(affiliateId: string): Promise<IAffiliateLinkStats> {
    const links = await this.affiliateLinkModel.find({ affiliateId });
    
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    const totalConversions = links.reduce((sum, link) => sum + link.conversionCount, 0);
    const totalCommission = links.reduce((sum, link) => sum + link.totalCommissionEarned, 0);
    
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const averageCommissionPerConversion = totalConversions > 0 ? totalCommission / totalConversions : 0;

    // Top performing links
    const topPerformingLinks = links
      .sort((a, b) => b.conversionCount - a.conversionCount)
      .slice(0, 5)
      .map(link => ({
        linkCode: link.linkCode,
        productName: 'Product Name', // TODO: Get from product service
        clicks: link.clickCount,
        conversions: link.conversionCount,
        commission: link.totalCommissionEarned
      }));

    return {
      totalClicks,
      totalConversions,
      conversionRate,
      totalCommission,
      averageCommissionPerConversion,
      topPerformingLinks
    };
  }

  async disableAffiliateLink(linkCode: string, affiliateId: string): Promise<AffiliateLinkDocument> {
    const link = await this.affiliateLinkModel.findOne({ linkCode, affiliateId });
    if (!link) {
      throw new NotFoundException('Link affiliate không tồn tại');
    }

    link.status = 'DISABLED';
    return await link.save();
  }

  async cleanupExpiredLinks(): Promise<number> {
    const result = await this.affiliateLinkModel.updateMany(
      { 
        expiresAt: { $lt: new Date() },
        status: 'ACTIVE'
      },
      { status: 'EXPIRED' }
    );
    
    return result.modifiedCount;
  }
}
