import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  UseGuards, 
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AffiliateService } from './affiliate.service';
import { CreateAffiliateDto, UpdateAffiliateDto } from './dto';
import { Throttle } from '@nestjs/throttler';
import { User } from '../common/meta/user.meta';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enum/role.enum';

@ApiTags('Affiliate System')
@Controller('affiliates')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng ký làm affiliate' })
  @ApiResponse({ 
    status: 201, 
    description: 'Đăng ký affiliate thành công',
    schema: {
      example: {
        success: true,
        data: {
          affiliateCode: 'USER123ABC456',
          commissionRate: 8,
          status: 'ACTIVE',
          minPayoutAmount: 100000
        }
      }
    }
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/phút
  @HttpCode(HttpStatus.CREATED)
  async registerAffiliate(
    @Body() createAffiliateDto: CreateAffiliateDto, 
    @User('_id') userId: string
  ) {
    console.log('User ID:', userId);
    const affiliate = await this.affiliateService.createAffiliate(userId, createAffiliateDto);
    
    return {
      success: true,
      data: {
        affiliateCode: affiliate.affiliateCode,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
        minPayoutAmount: affiliate.minPayoutAmount
      }
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin affiliate profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thông tin affiliate thành công',
    schema: {
      example: {
        success: true,
        data: {
          affiliateCode: 'USER123ABC456',
          commissionRate: 8,
          totalEarnings: 1500000,
          totalReferrals: 25,
          approvedReferrals: 20,
          status: 'ACTIVE',
          paymentInfo: {
            bankName: 'Vietcombank',
            accountNumber: '1234567890',
            accountHolder: 'Nguyễn Văn A'
          }
        }
      }
    }
  })
  async getAffiliateProfile(@User('_id') userId: string) {
    const affiliate = await this.affiliateService.getAffiliateProfile(userId);
    
    return {
      success: true,
      data: affiliate
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin affiliate' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cập nhật thông tin affiliate thành công' 
  })
  async updateAffiliateProfile(
    @Body() updateAffiliateDto: UpdateAffiliateDto,
    @User('_id') userId: string
  ) {
    const affiliate = await this.affiliateService.updateAffiliateProfile(userId, updateAffiliateDto);
    
    return {
      success: true,
      data: affiliate
    };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy dashboard affiliate' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy dashboard affiliate thành công',
    schema: {
      example: {
        success: true,
        data: {
          totalEarnings: 1500000,
          totalReferrals: 25,
          approvedReferrals: 20,
          pendingReferrals: 5,
          commissionRate: 8,
          status: 'ACTIVE',
          nextPayoutDate: '2024-02-20T00:00:00Z'
        }
      }
    }
  })
  async getAffiliateDashboard(@User('_id') userId: string) {
    const dashboard = await this.affiliateService.getAffiliateDashboard(userId);
    
    return {
      success: true,
      data: dashboard
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê affiliate' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê affiliate thành công'
  })
  async getAffiliateStats(@User('_id') userId: string) {
    const stats = await this.affiliateService.getAffiliateStats(userId);
    
    return {
      success: true,
      data: stats
    };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch affiliate' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy lịch sử giao dịch thành công'
  })
  async getTransactionHistory(@User('_id') userId: string) {
    const affiliate = await this.affiliateService.getAffiliateByUserId(userId);
    if (!affiliate) {
      return {
        success: false,
        message: 'Không tìm thấy thông tin affiliate'
      };
    }

    const transactions = await this.affiliateService.getTransactionHistory(affiliate._id.toString());
    
    return {
      success: true,
      data: transactions
    };
  }

  @Get('referrals')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách referrals' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách referrals thành công'
  })
  async getReferrals(@User('_id') userId: string) {
    const affiliate = await this.affiliateService.getAffiliateByUserId(userId);
    if (!affiliate) {
      return {
        success: false,
        message: 'Không tìm thấy thông tin affiliate'
      };
    }

    const referrals = await this.affiliateService.getReferrals(affiliate._id.toString());
    
    return {
      success: true,
      data: referrals
    };
  }

  @Post('payout')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yêu cầu rút tiền' })
  @ApiResponse({ 
    status: 200, 
    description: 'Yêu cầu rút tiền thành công'
  })
  async requestPayout(
    @Body() payoutDto: { amount: number },
    @User('_id') userId: string
  ) {
    const result = await this.affiliateService.requestPayout(userId, payoutDto.amount);
    
    return {
      success: true,
      data: result
    };
  }
}
