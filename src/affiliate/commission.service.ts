import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AffiliateRepo } from './affiliate.repo';
import { CommissionTransaction, CommissionTransactionDocument } from './schemas/commission.schema';
import { Referral, ReferralDocument } from './schemas/referral.schema';

@Injectable()
export class CommissionService {
  constructor(
    private readonly affiliateRepo: AffiliateRepo,
    @InjectModel(CommissionTransaction.name)
    private commissionModel: Model<CommissionTransactionDocument>,
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>
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
        order.totalAmount || order.total_items, 
        affiliate.commissionRate
      );
      
      // Tìm hoặc tạo referral record
      let referral = await this.referralModel.findOne({
        affiliateId: affiliate._id,
        referredUserEmail: order.userEmail || order.user?.email
      });

      if (!referral) {
        // Tạo referral mới nếu chưa có
        referral = await this.referralModel.create({
          affiliateId: affiliate._id,
          referredUserId: order.userId,
          referredUserEmail: order.userEmail || order.user?.email,
          status: 'PENDING',
          commissionEarned: 0,
          referralDate: new Date()
        });
      }

      // Tạo commission transaction
      const commissionTransaction = await this.commissionModel.create({
        affiliateId: affiliate._id,
        orderId: order._id,
        referralId: referral._id,
        orderAmount: order.totalAmount || order.total_items,
        commission: commission,
        commissionRate: affiliate.commissionRate,
        status: 'PENDING',
        notes: `Commission from order ${order._id}`
      });

      // Cập nhật tổng earnings của affiliate
      await this.affiliateRepo.update(affiliate._id.toString(), {
        totalEarnings: affiliate.totalEarnings + commission
      });

      // Cập nhật referral với commission earned
      await this.referralModel.findByIdAndUpdate(referral._id, {
        $inc: { commissionEarned: commission },
        status: 'APPROVED'
      });

      console.log(`✅ Commission processed: ${commission} VND for affiliate ${affiliate.affiliateCode}`);
      
      return {
        commission,
        transactionId: commissionTransaction._id,
        affiliateId: affiliate._id
      };
    } catch (error) {
      console.error('Error processing commission after payment:', error);
      return null;
    }
  }

  async getCommissionHistory(affiliateId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      this.commissionModel
        .find({ affiliateId })
        .populate('orderId', 'totalAmount createdAt')
        .populate('referralId', 'referredUserEmail status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commissionModel.countDocuments({ affiliateId })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateCommissionStatus(transactionId: string, status: string, paymentMethod?: string, paymentReference?: string) {
    const updateData: any = { status };
    
    if (status === 'PAID') {
      updateData.paidDate = new Date();
    }
    
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    
    if (paymentReference) {
      updateData.paymentReference = paymentReference;
    }

    return await this.commissionModel.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true }
    );
  }
}
