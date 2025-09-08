import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ReferralService } from '../referral.service';

@Injectable()
export class FraudPreventionGuard implements CanActivate {
  constructor(private readonly referralService: ReferralService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const affiliateId = request.user?.id;
    
    if (!affiliateId) return true;
    
    // 🔥 IMPLEMENTED: Fraud prevention logic
    await this.checkReferralLimit(affiliateId);
    await this.checkSuspiciousPatterns(affiliateId);
    await this.checkIPAddress(request);
    
    return true;
  }

  /**
   * Kiểm tra giới hạn số lượng referrals trong 24h
   */
  private async checkReferralLimit(affiliateId: string): Promise<void> {
    const recentReferrals = await this.referralService.countRecentReferrals(
      affiliateId, 
      24 * 60 * 60 * 1000 // 24 giờ
    );
    
    if (recentReferrals > 10) {
      throw new BadRequestException('Quá nhiều referrals trong 24h, vui lòng thử lại sau');
    }
  }

  /**
   * Kiểm tra các pattern đáng ngờ
   */
  private async checkSuspiciousPatterns(affiliateId: string): Promise<void> {
    const recentReferrals = await this.referralService.getRecentReferrals(
      affiliateId, 
      24 * 60 * 60 * 1000
    );
    
    // Kiểm tra referrals được tạo quá nhanh (mỗi giây)
    const suspiciousTiming = this.checkReferralTiming(recentReferrals);
    if (suspiciousTiming) {
      throw new BadRequestException('Referrals được tạo quá nhanh, có thể là bot');
    }
    
    // Kiểm tra pattern email/phone đáng ngờ
    const suspiciousData = this.checkReferralData(recentReferrals);
    if (suspiciousData) {
      throw new BadRequestException('Dữ liệu referrals có pattern đáng ngờ');
    }
  }

  /**
   * Kiểm tra IP address
   */
  private async checkIPAddress(request: any): Promise<void> {
    const clientIP = request.ip || request.connection.remoteAddress;
    
    // Kiểm tra IP từ data center (có thể là bot)
    if (this.isDataCenterIP(clientIP)) {
      throw new BadRequestException('IP address từ data center không được phép');
    }
    
    // Kiểm tra IP từ nước ngoài (có thể là VPN)
    if (this.isForeignIP(clientIP)) {
      console.warn(`Suspicious IP detected: ${clientIP} from foreign country`);
      // Không block ngay, chỉ log warning
    }
  }

  /**
   * Kiểm tra timing của referrals
   */
  private checkReferralTiming(referrals: any[]): boolean {
    if (referrals.length < 2) return false;
    
    // Sắp xếp theo thời gian tạo
    const sortedReferrals = referrals.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Kiểm tra có referrals nào được tạo cách nhau < 5 giây không
    for (let i = 1; i < sortedReferrals.length; i++) {
      const timeDiff = new Date(sortedReferrals[i].createdAt).getTime() - 
                      new Date(sortedReferrals[i-1].createdAt).getTime();
      
      if (timeDiff < 5000) { // 5 giây
        return true; // Suspicious
      }
    }
    
    return false;
  }

  /**
   * Kiểm tra dữ liệu referrals
   */
  private checkReferralData(referrals: any[]): boolean {
    if (referrals.length < 2) return false;
    
    // Kiểm tra tất cả referrals có cùng pattern email không
    const emailPatterns = referrals.map(r => {
      const email = r.referredUserEmail;
      return email.split('@')[0]; // Phần trước @
    });
    
    const uniquePatterns = new Set(emailPatterns);
    if (uniquePatterns.size === 1 && referrals.length > 3) {
      return true; // Suspicious - tất cả cùng pattern
    }
    
    // Kiểm tra phone numbers có pattern đáng ngờ
    const phonePatterns = referrals.map(r => {
      const phone = r.referredUserPhone;
      return phone.replace(/\D/g, ''); // Chỉ giữ số
    });
    
    // Kiểm tra có phone numbers liên tiếp không
    const sortedPhones = phonePatterns.sort();
    for (let i = 1; i < sortedPhones.length; i++) {
      const current = parseInt(sortedPhones[i]);
      const previous = parseInt(sortedPhones[i-1]);
      
      if (current - previous === 1) {
        return true; // Suspicious - phone numbers liên tiếp
      }
    }
    
    return false;
  }

  /**
   * Kiểm tra IP có phải từ data center không
   */
  private isDataCenterIP(ip: string): boolean {
    // Danh sách các IP ranges của data centers phổ biến
    const dataCenterRanges = [
      '10.0.0.0/8',      // Private network
      '172.16.0.0/12',   // Private network  
      '192.168.0.0/16',  // Private network
      '169.254.0.0/16',  // Link-local
    ];
    
    // Kiểm tra IP có trong ranges này không
    return dataCenterRanges.some(range => this.ipInRange(ip, range));
  }

  /**
   * Kiểm tra IP có phải từ nước ngoài không
   */
  private isForeignIP(ip: string): boolean {
    // Danh sách IP ranges của Việt Nam (có thể mở rộng)
    const vietnamRanges = [
      '113.160.0.0/13',   // VNPT
      '115.72.0.0/13',    // FPT
      '117.0.0.0/13',     // Viettel
      '125.234.0.0/15',   // VNPT
      '203.162.0.0/16',   // VNPT
    ];
    
    // Nếu IP không thuộc VN ranges → có thể là foreign
    return !vietnamRanges.some(range => this.ipInRange(ip, range));
  }

  /**
   * Kiểm tra IP có trong range không
   */
  private ipInRange(ip: string, range: string): boolean {
    // Simple implementation - có thể dùng thư viện chuyên dụng
    const [rangeIP, mask] = range.split('/');
    const maskNum = parseInt(mask);
    
    // Convert IP to number
    const ipNum = this.ipToNumber(ip);
    const rangeNum = this.ipToNumber(rangeIP);
    
    // Check if IP is in range
    const maskValue = Math.pow(2, 32 - maskNum) - 1;
    return (ipNum & maskValue) === (rangeNum & maskValue);
  }

  /**
   * Convert IP string to number
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => 
      (acc << 8) + parseInt(octet), 0
    ) >>> 0;
  }
}
