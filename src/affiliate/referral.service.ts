import { Injectable, BadRequestException } from '@nestjs/common';
import { AffiliateRepo } from './affiliate.repo';
import { ICreateReferral } from './model/referral.model';

@Injectable()
export class ReferralService {
  constructor(
    private readonly affiliateRepo: AffiliateRepo
  ) {}

  async createReferral(createReferralDto: ICreateReferral) {
    const { affiliateCode, userData } = createReferralDto;
    
    // Kiểm tra affiliate code hợp lệ
    const affiliate = await this.affiliateRepo.findByCode(affiliateCode);
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      throw new BadRequestException('Affiliate code không hợp lệ');
    }
    
    // TODO: Implement referral creation logic
    // - Kiểm tra user chưa được refer trước đó
    // - Kiểm tra không tự refer chính mình
    // - Tạo referral record
    // - Cập nhật số lượng referrals của affiliate
    
    return { success: true, message: 'Referral được tạo thành công' };
  }

  async getMyReferrals(userId: string, page: number = 1, limit: number = 10) {
    // TODO: Implement get referrals logic
    // - Lấy danh sách referrals của affiliate
    // - Phân trang
    // - Filter theo status
    
    return {
      referrals: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }

  /**
   * Đếm số lượng referrals trong khoảng thời gian
   */
  async countRecentReferrals(affiliateId: string, timeWindow: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindow);
    
    // TODO: Implement với ReferralRepo
    // return this.referralRepo.countRecentReferrals(affiliateId, cutoffTime);
    
    // Temporary implementation
    return 0;
  }

  /**
   * Lấy danh sách referrals gần đây
   */
  async getRecentReferrals(affiliateId: string, timeWindow: number): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - timeWindow);
    
    // TODO: Implement với ReferralRepo
    // return this.referralRepo.findRecentReferrals(affiliateId, cutoffTime);
    
    // Temporary implementation
    return [];
  }
}
