import { 
  Controller, 
  Get, 
  Query, 
  UseGuards, 
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommissionService } from './commission.service';

@ApiTags('Commission System')
@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử commission' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PAID', 'CANCELLED'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy lịch sử commission thành công',
    schema: {
      example: {
        success: true,
        data: {
          transactions: [
            {
              orderId: '64f8a1b2c3d4e5f6a7b8c9d2',
              orderAmount: 500000,
              commission: 40000,
              commissionRate: 8,
              status: 'PAID',
              transactionDate: '2024-01-15T10:30:00Z',
              paidDate: '2024-01-20T15:00:00Z'
            }
          ]
        }
      }
    }
  })
  async getCommissionHistory(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string
  ) {
    const userId = req.user.id;
    
    // Tìm affiliate ID từ user ID
    const affiliate = await this.commissionService['affiliateRepo'].findByUserId(userId);
    if (!affiliate) {
      return {
        success: false,
        message: 'Không tìm thấy thông tin affiliate'
      };
    }

    const result = await this.commissionService.getCommissionHistory(
      affiliate._id.toString(),
      page,
      limit
    );
    
    return {
      success: true,
      data: result
    };
  }
}
