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
      // Trả về thông tin để user biết cần đăng ký affiliate
      return {
        isRegistered: false,
        message: 'Bạn chưa đăng ký làm affiliate. Vui lòng đăng ký để bắt đầu kiếm hoa hồng.',
        registrationRequired: true
      };
    }
    
    return {
      ...affiliate,
      isRegistered: true
    };
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
      
      // Tính commission
      const orderAmount = order.totalAmount || order.total_items || 0;
      const commission = Math.round((orderAmount * affiliate.commissionRate) / 100);
      
      // TODO: Implement full commission processing with CommissionService
      // For now, just return the calculated commission
      
      return {
        commission,
        affiliateId: affiliate._id,
        commissionRate: affiliate.commissionRate
      };
    } catch (error) {
      console.error('Error processing commission after payment:', error);
      return null;
    }
  }

  async getAffiliateByUserId(userId: string) {
    return await this.affiliateRepo.findByUserId(userId);
  }

  async getAffiliateStats(userId: string) {
    const affiliate = await this.affiliateRepo.findByUserId(userId);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy thông tin affiliate');
    }

    // Lấy thống kê cơ bản
    return {
      affiliateCode: affiliate.affiliateCode,
      commissionRate: affiliate.commissionRate,
      totalEarnings: affiliate.totalEarnings,
      totalReferrals: affiliate.totalReferrals,
      approvedReferrals: affiliate.approvedReferrals,
      status: affiliate.status,
      minPayoutAmount: affiliate.minPayoutAmount,
      lastPayoutDate: affiliate.lastPayoutDate,
      createdAt: affiliate._id.getTimestamp(),
      updatedAt: affiliate._id.getTimestamp()
    };
  }

  async getTransactionHistory(affiliateId: string) {
    // TODO: Implement transaction history logic
    // This should return commission transactions, payouts, etc.
    return {
      transactions: [],
      totalEarnings: 0,
      totalPayouts: 0,
      pendingAmount: 0
    };
  }

  async getReferrals(affiliateId: string) {
    // TODO: Implement referrals logic
    // This should return list of referrals made by this affiliate
    return {
      referrals: [],
      totalReferrals: 0,
      approvedReferrals: 0,
      pendingReferrals: 0
    };
  }

  async requestPayout(userId: string, amount: number) {
    const affiliate = await this.affiliateRepo.findByUserId(userId);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy thông tin affiliate');
    }

    if (amount < affiliate.minPayoutAmount) {
      throw new BadRequestException(`Số tiền rút tối thiểu là ${affiliate.minPayoutAmount} VND`);
    }

    if (amount > affiliate.totalEarnings) {
      throw new BadRequestException('Số tiền rút không được vượt quá tổng thu nhập');
    }

    // TODO: Implement payout request logic
    return {
      success: true,
      message: 'Yêu cầu rút tiền đã được gửi thành công',
      requestId: new Date().getTime().toString(),
      amount,
      status: 'PENDING'
    };
  }
}
