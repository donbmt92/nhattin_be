import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto';

@ApiTags('Referral System')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo referral khi user đăng ký' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo referral thành công',
    schema: {
      example: {
        success: true,
        data: {
          referralId: '64f8a1b2c3d4e5f6a7b8c9d1',
          status: 'PENDING',
          commissionEarned: 0
        }
      }
    }
  })
  @HttpCode(HttpStatus.CREATED)
  async createReferral(@Body() createReferralDto: CreateReferralDto) {
    const result = await this.referralService.createReferral(createReferralDto);
    
    return {
      success: true,
      data: result
    };
  }

  @Get('my-referrals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách referrals của affiliate' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách referrals thành công',
    schema: {
      example: {
        success: true,
        data: {
          referrals: [
            {
              referredUserEmail: 'user1@example.com',
              status: 'APPROVED',
              commissionEarned: 50000,
              totalOrderValue: 500000,
              totalOrders: 3,
              referralDate: '2024-01-15T10:30:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3
          }
        }
      }
    }
  })
  async getMyReferrals(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string
  ) {
    const userId = req.user.id;
    const result = await this.referralService.getMyReferrals(userId, page, limit);
    
    return {
      success: true,
      data: result
    };
  }
}
