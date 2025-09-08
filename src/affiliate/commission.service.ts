import { Injectable } from '@nestjs/common';
import { AffiliateRepo } from './affiliate.repo';

@Injectable()
export class CommissionService {
  constructor(
    private readonly affiliateRepo: AffiliateRepo
  ) {}

  async calculateCommission(orderAmount: number, rate: number): Promise<number> {
    const commission = (orderAmount * rate) / 100;
    return Math.round(commission / 1000) * 1000; // Làm tròn đến 1000
  }

  async processCommissionAfterPayment(order: any) {
    try {
      // Kiểm tra order có affiliate code không
      if (!order.affiliateCode) return null;
      
      // Tìm affiliate
      const affiliate = await this.affiliateRepo.findByCode(order.affiliateCode);
      if (!affiliate || affiliate.status !== 'ACTIVE') return null;
      
      // Tính commission
      const commission = await this.calculateCommission(
        order.total_items, 
        affiliate.commissionRate
      );
      
      // TODO: Tạo commission transaction
      // TODO: Cập nhật tổng earnings của affiliate
      // TODO: Cập nhật order với commission info
      
      return commission;
    } catch (error) {
      console.error('Error processing commission after payment:', error);
      return null;
    }
  }
}
