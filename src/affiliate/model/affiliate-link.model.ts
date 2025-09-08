import { Document } from 'mongoose';

export interface IAffiliateLink extends Document {
  _id: string;
  affiliateId: string;
  productId: string;
  linkCode: string;
  originalUrl: string;
  shortUrl: string;
  expiresAt: Date;
  clickCount: number;
  conversionCount: number;
  totalCommissionEarned: number;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
  campaignName?: string;
  notes?: string;
  clickedByIPs: string[];
  convertedUserIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateAffiliateLink {
  affiliateId: string;
  productId: string;
  expiresAt: Date;
  campaignName?: string;
  notes?: string;
}

export interface IAffiliateLinkStats {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommission: number;
  averageCommissionPerConversion: number;
  topPerformingLinks: Array<{
    linkCode: string;
    productName: string;
    clicks: number;
    conversions: number;
    commission: number;
  }>;
}

export interface IAffiliateLinkClick {
  linkCode: string;
  userIP: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
}
