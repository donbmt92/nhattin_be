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

  async getTransactionHistory(_affiliateId: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // TODO: Implement transaction history logic
    // This should return commission transactions, payouts, etc.
    return {
      transactions: [],
      totalEarnings: 0,
      totalPayouts: 0,
      pendingAmount: 0
    };
  }

  async getReferrals(_affiliateId: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
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

  // Admin methods
  async getAllAffiliates(page: number = 1, limit: number = 10, status?: string) {
    console.log('=== getAllAffiliates called ===');
    console.log('Params:', { page, limit, status });
    
    const skip = (page - 1) * limit;
    const filter: any = {};
    
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    console.log('Filter:', filter);
    const affiliates = await this.affiliateRepo.findAll(filter, skip, limit);
    const total = await this.affiliateRepo.count(filter);
    
    console.log('Raw affiliates from DB:', affiliates.length, 'items');
    console.log('Total count:', total);

    // Populate user information for each affiliate
    const affiliatesWithUsers = await Promise.all(
      affiliates.map(async (affiliate, index) => {
        console.log(`Processing affiliate ${index + 1}:`, {
          id: affiliate._id,
          userId: affiliate.userId,
          status: affiliate.status,
          totalEarnings: affiliate.totalEarnings
        });
        
        const user = await this.usersService.getUserById(affiliate.userId.toString());
        console.log(`User data for affiliate ${index + 1}:`, {
          id: user._id,
          name: user.name,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          image: user.image
        });
        
        const result = {
          id: affiliate._id.toString(),
          userId: affiliate.userId.toString(),
          affiliateCode: affiliate.affiliateCode,
          commissionRate: affiliate.commissionRate,
          totalEarnings: affiliate.totalEarnings || 0,
          totalReferrals: affiliate.totalReferrals || 0,
          approvedReferrals: affiliate.approvedReferrals || 0,
          status: affiliate.status,
          paymentInfo: affiliate.paymentInfo,
          minPayoutAmount: affiliate.minPayoutAmount,
          createdAt: affiliate._id.getTimestamp(),
          updatedAt: affiliate._id.getTimestamp(),
          user: {
            id: user._id.toString(),
            name: user.name || user.username || user.fullName || 'Không có tên',
            email: user.email || 'Không có email',
            avatar: user.avatar || user.image
          }
        };
        
        console.log(`Final affiliate ${index + 1} data:`, result);
        return result;
      })
    );

    const finalResult = {
      affiliates: affiliatesWithUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
    
    console.log('=== Final result ===');
    console.log('Total affiliates returned:', finalResult.affiliates.length);
    console.log('First affiliate sample:', finalResult.affiliates[0]);
    console.log('========================');
    
    return finalResult;
  }

  async getAdminStats() {
    console.log('=== getAdminStats called ===');
    
    const totalAffiliates = await this.affiliateRepo.count({});
    const activeAffiliates = await this.affiliateRepo.count({ status: 'ACTIVE' });
    const pendingAffiliates = await this.affiliateRepo.count({ status: 'PENDING' });
    
    console.log('Counts:', { totalAffiliates, activeAffiliates, pendingAffiliates });
    
    // Calculate total commissions
    const allAffiliates = await this.affiliateRepo.findAll({}, 0, 1000);
    console.log('All affiliates for calculation:', allAffiliates.length);
    
    const totalCommissions = allAffiliates.reduce((sum, affiliate) => {
      console.log('Adding earnings:', affiliate.totalEarnings, 'to sum:', sum);
      return sum + (affiliate.totalEarnings || 0);
    }, 0);
    
    // Calculate total referrals
    const totalReferrals = allAffiliates.reduce((sum, affiliate) => sum + (affiliate.totalReferrals || 0), 0);
    const totalApprovedReferrals = allAffiliates.reduce((sum, affiliate) => sum + (affiliate.approvedReferrals || 0), 0);
    
    const conversionRate = totalReferrals > 0 ? (totalApprovedReferrals / totalReferrals) * 100 : 0;

    const result = {
      totalAffiliates,
      activeAffiliates,
      pendingAffiliates,
      totalCommissions,
      totalClicks: 0, // TODO: Implement clicks tracking
      totalConversions: totalApprovedReferrals,
      conversionRate
    };
    
    console.log('Final stats result:', result);
    console.log('========================');
    
    return result;
  }

  async getAffiliateById(id: string) {
    const affiliate = await this.affiliateRepo.findById(id);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy affiliate');
    }

    const user = await this.usersService.getUserById(affiliate.userId.toString());
    
    return {
      id: affiliate._id.toString(),
      userId: affiliate.userId.toString(),
      affiliateCode: affiliate.affiliateCode,
      commissionRate: affiliate.commissionRate,
      totalEarnings: affiliate.totalEarnings || 0,
      totalReferrals: affiliate.totalReferrals || 0,
      approvedReferrals: affiliate.approvedReferrals || 0,
      status: affiliate.status,
      paymentInfo: affiliate.paymentInfo,
      minPayoutAmount: affiliate.minPayoutAmount,
      createdAt: affiliate._id.getTimestamp(),
      updatedAt: affiliate._id.getTimestamp(),
      user: {
        id: user._id.toString(),
        name: user.name || user.username || user.fullName || 'Không có tên',
        email: user.email || 'Không có email',
        avatar: user.avatar || user.image,
        phone: user.phone
      }
    };
  }

  async updateAffiliateStatus(id: string, status: string) {
    const affiliate = await this.affiliateRepo.findById(id);
    if (!affiliate) {
      throw new NotFoundException('Không tìm thấy affiliate');
    }

    const updatedAffiliate = await this.affiliateRepo.update(id, { status: status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' });
    
    const user = await this.usersService.getUserById(updatedAffiliate.userId.toString());
    
    return {
      id: updatedAffiliate._id.toString(),
      userId: updatedAffiliate.userId.toString(),
      affiliateCode: updatedAffiliate.affiliateCode,
      commissionRate: updatedAffiliate.commissionRate,
      totalEarnings: updatedAffiliate.totalEarnings || 0,
      totalReferrals: updatedAffiliate.totalReferrals || 0,
      approvedReferrals: updatedAffiliate.approvedReferrals || 0,
      status: updatedAffiliate.status,
      paymentInfo: updatedAffiliate.paymentInfo,
      minPayoutAmount: updatedAffiliate.minPayoutAmount,
      createdAt: updatedAffiliate._id.getTimestamp(),
      updatedAt: updatedAffiliate._id.getTimestamp(),
      user: {
        id: user._id.toString(),
        name: user.name || user.username || user.fullName || 'Không có tên',
        email: user.email || 'Không có email',
        avatar: user.avatar || user.image,
        phone: user.phone
      }
    };
  }

  async getAffiliateCommissions(affiliateId: string, page: number = 1, limit: number = 10) {
    // TODO: Implement commission service integration
    // For now, return mock data
    const mockCommissions = [
      {
        id: '1',
        orderId: 'ORD-001',
        orderAmount: 1000000,
        commission: 50000,
        commissionRate: 5,
        status: 'PAID',
        transactionDate: '2024-01-20T00:00:00Z',
        paidDate: '2024-01-25T00:00:00Z'
      },
      {
        id: '2',
        orderId: 'ORD-002',
        orderAmount: 1500000,
        commission: 75000,
        commissionRate: 5,
        status: 'PENDING',
        transactionDate: '2024-01-22T00:00:00Z'
      }
    ];

    return {
      commissions: mockCommissions,
      total: mockCommissions.length,
      page,
      limit,
      totalPages: 1
    };
  }

  async getAffiliateLinks(affiliateId: string, page: number = 1, limit: number = 10) {
    // TODO: Implement affiliate link service integration
    // For now, return mock data
    const mockLinks = [
      {
        id: '1',
        productId: 'product1',
        product: {
          id: 'product1',
          name: 'Sản phẩm A',
          price: 1000000,
          image: '/images/product1.jpg'
        },
        clicks: 500,
        conversions: 10,
        earnings: 500000,
        createdAt: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        productId: 'product2',
        product: {
          id: 'product2',
          name: 'Sản phẩm B',
          price: 1500000,
          image: '/images/product2.jpg'
        },
        clicks: 750,
        conversions: 15,
        earnings: 750000,
        createdAt: '2024-01-16T00:00:00Z'
      }
    ];

    return {
      links: mockLinks,
      total: mockLinks.length,
      page,
      limit,
      totalPages: 1
    };
  }
}
