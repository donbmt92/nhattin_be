import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param,
  UseGuards, 
  HttpCode,
  HttpStatus,
  Req,
  Res
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AffiliateLinkService } from './affiliate-link.service';
import { CreateAffiliateLinkDto, AffiliateLinkResponseDto } from './dto/create-affiliate-link.dto';
import { Throttle } from '@nestjs/throttler';
import { User } from '../common/meta/user.meta';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enum/role.enum';
import { Request, Response } from 'express';
import { CleanupExpiredLinksTask } from './tasks/cleanup-expired-links.task';
import { AffiliateRepo } from './affiliate.repo';

@ApiTags('Affiliate Links')
@Controller('affiliate-links')
export class AffiliateLinkController {
  constructor(
    private readonly affiliateLinkService: AffiliateLinkService,
    private readonly cleanupTask: CleanupExpiredLinksTask,
    private readonly affiliateRepo: AffiliateRepo
  ) {}

  private async getAffiliateIdFromUserId(userId: string): Promise<string> {
    const affiliate = await this.affiliateRepo.findByUserId(userId);
    if (!affiliate) {
      throw new Error('User chưa đăng ký affiliate');
    }
    return affiliate._id.toString();
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test endpoint để debug date validation' })
  async testDateValidation(@Body() body: any) {
    console.log('Test body:', body);
    console.log('expiresAt type:', typeof body.expiresAt);
    console.log('expiresAt value:', body.expiresAt);
    
    return {
      success: true,
      data: {
        originalBody: body,
        expiresAtType: typeof body.expiresAt,
        expiresAtValue: body.expiresAt
      }
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo affiliate link mới' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tạo affiliate link thành công',
    type: AffiliateLinkResponseDto
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests/phút
  @HttpCode(HttpStatus.CREATED)
  async createAffiliateLink(
    @Body() createLinkDto: CreateAffiliateLinkDto,
    @User('_id') userId: string
  ) {
    const affiliateId = await this.getAffiliateIdFromUserId(userId);

    const link = await this.affiliateLinkService.createAffiliateLink(affiliateId, {
      ...createLinkDto,
      affiliateId
    });
    
    return {
      success: true,
      data: {
        id: link._id,
        linkCode: link.linkCode,
        originalUrl: link.originalUrl,
        shortUrl: link.shortUrl,
        expiresAt: link.expiresAt,
        clickCount: link.clickCount,
        conversionCount: link.conversionCount,
        totalCommissionEarned: link.totalCommissionEarned,
        status: link.status,
        campaignName: link.campaignName,
        notes: link.notes,
        createdAt: link.createdAt
      }
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách affiliate links của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách affiliate links thành công'
  })
  async getAffiliateLinks(@User('_id') userId: string) {
    const affiliateId = await this.getAffiliateIdFromUserId(userId);

    const links = await this.affiliateLinkService.getAffiliateLinks(affiliateId);
    
    return {
      success: true,
      data: links.map(link => ({
        id: link._id,
        linkCode: link.linkCode,
        originalUrl: link.originalUrl,
        shortUrl: link.shortUrl,
        expiresAt: link.expiresAt,
        clickCount: link.clickCount,
        conversionCount: link.conversionCount,
        totalCommissionEarned: link.totalCommissionEarned,
        status: link.status,
        campaignName: link.campaignName,
        notes: link.notes,
        createdAt: link.createdAt
      }))
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê affiliate links' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thống kê thành công'
  })
  async getAffiliateLinkStats(@User('_id') userId: string) {
    const affiliateId = await this.getAffiliateIdFromUserId(userId);

    const stats = await this.affiliateLinkService.getAffiliateLinkStats(affiliateId);
    
    return {
      success: true,
      data: stats
    };
  }

  @Put(':linkCode/disable')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vô hiệu hóa affiliate link' })
  @ApiParam({ name: 'linkCode', description: 'Mã link affiliate' })
  @ApiResponse({ 
    status: 200, 
    description: 'Vô hiệu hóa link thành công'
  })
  async disableAffiliateLink(
    @Param('linkCode') linkCode: string,
    @User('_id') userId: string
  ) {
    const affiliateId = await this.getAffiliateIdFromUserId(userId);

    const link = await this.affiliateLinkService.disableAffiliateLink(linkCode, affiliateId);
    
    return {
      success: true,
      data: {
        linkCode: link.linkCode,
        status: link.status
      }
    };
  }

  @Post('cleanup-expired')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cleanup expired affiliate links (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cleanup expired links thành công'
  })
  async cleanupExpiredLinks() {
    const cleanedCount = await this.cleanupTask.handleCleanupExpiredLinks();
    
    return {
      success: true,
      data: {
        cleanedCount,
        message: `Đã cleanup ${cleanedCount} expired affiliate links`
      }
    };
  }
}

@Controller('affiliate')
export class AffiliateRedirectController {
  constructor(private readonly affiliateLinkService: AffiliateLinkService) {}

  @Get('redirect/:linkCode')
  @ApiOperation({ summary: 'Redirect affiliate link' })
  @ApiParam({ name: 'linkCode', description: 'Mã link affiliate' })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirect đến trang sản phẩm'
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests/phút
  async redirectAffiliateLink(
    @Param('linkCode') linkCode: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      // Lấy IP của user
      const userIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      
      // Track click
      const link = await this.affiliateLinkService.trackClick(linkCode, userIP);
      
      // Redirect đến trang sản phẩm
      res.redirect(302, link.originalUrl);
    } catch (error) {
      // Nếu link không hợp lệ, redirect về trang chủ
      res.redirect(302, process.env.FRONTEND_URL || 'http://localhost:3001');
    }
  }
}
