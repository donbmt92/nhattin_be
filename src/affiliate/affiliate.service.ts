import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AffiliateRepo } from './affiliate.repo';
import { ICreateAffiliateFromDto, IUpdateAffiliate } from './model/affiliate.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class AffiliateService {
  constructor(
    private readonly affiliateRepo: AffiliateRepo,
    private readonly usersService: UsersService
  ) {}

  private generateAffiliateCode(userId: string | any): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    
    // Chuyển đổi userId thành string nếu là ObjectId
    const userIdStr = userId?.toString() || '';
    const userSuffix = userIdStr ? userIdStr.substr(-4) : 'USER';
    
    return `${userSuffix}${timestamp}${random}`.toUpperCase();
  }

  async createAffiliate(userId: string, createAffiliateDto: ICreateAffiliateFromDto) {
    // Kiểm tra user đã là affiliate chưa
    const existingAffiliate = await this.affiliateRepo.findByUserId(userId);
    if (existingAffiliate) {
      throw new BadRequestException('User đã là affiliate');
    }

    const affiliateCode = this.generateAffiliateCode(userId);
    
    const affiliate = await this.affiliateRepo.create({
      userId,
      affiliateCode,
      commissionRate: createAffiliateDto.commissionRate,
      paymentInfo: createAffiliateDto.paymentInfo,
      notes: createAffiliateDto.notes
    });
    
    // Cập nhật user
    await this.usersService.updateUser(userId, {
      isAffiliate: true,
      affiliateCode
    });
    
    return affiliate;
  }

  async getAffiliateProfile(userId: string) {
    const affiliate = await this.affiliateRepo.findByUserId(userId);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy thông tin affiliate');
    }
    
    return affiliate;
  }

  async updateAffiliateProfile(userId: string, updateAffiliateDto: IUpdateAffiliate) {
    const affiliate = await this.affiliateRepo.findByUserId(userId);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy thông tin affiliate');
    }
    
    return this.affiliateRepo.update(affiliate._id.toString(), updateAffiliateDto);
  }

  async getAffiliateDashboard(userId: string) {
    const affiliate = await this.affiliateRepo.findByUserId(userId);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy thông tin affiliate');
    }
    
    // TODO: Implement dashboard logic with referral and commission data
    return {
      totalEarnings: affiliate.totalEarnings,
      totalReferrals: affiliate.totalReferrals,
      approvedReferrals: affiliate.approvedReferrals,
      pendingReferrals: affiliate.totalReferrals - affiliate.approvedReferrals,
      commissionRate: affiliate.commissionRate,
      status: affiliate.status,
      nextPayoutDate: this.calculateNextPayoutDate(affiliate.lastPayoutDate)
    };
  }

  private calculateNextPayoutDate(lastPayoutDate?: Date): Date {
    const nextPayout = new Date();
    
    if (lastPayoutDate) {
      // Nếu có lần payout cuối, tính từ lần đó + 30 ngày
      nextPayout.setTime(lastPayoutDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    } else {
      // Nếu chưa có lần payout nào, tính từ hôm nay + 30 ngày
      nextPayout.setDate(nextPayout.getDate() + 30);
    }
    
    return nextPayout;
  }

  async processCommissionAfterPayment(order: any) {
    try {
      // Kiểm tra order có affiliate code không
      if (!order.affiliateCode) return null;
      
      // Tìm affiliate
      const affiliate = await this.affiliateRepo.findByCode(order.affiliateCode as string);
      if (!affiliate || affiliate.status !== 'ACTIVE') return null;
      
      // TODO: Implement commission calculation and processing
      // This will be implemented in CommissionService
      
      return true;
    } catch (error) {
      console.error('Error processing commission after payment:', error);
      return null;
    }
  }
}
