

export interface IAffiliate {
  _id: string;
  userId: string;
  affiliateCode: string;
  commissionRate: number;
  totalEarnings: number;
  totalReferrals: number;
  approvedReferrals: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankCode?: string;
  };
  minPayoutAmount: number;
  lastPayoutDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateAffiliate {
  userId: string;
  affiliateCode: string;
  commissionRate: number;
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankCode?: string;
  };
  notes?: string;
}

export interface ICreateAffiliateFromDto {
  commissionRate: number;
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankCode?: string;
  };
  notes?: string;
}

export interface IUpdateAffiliate {
  commissionRate?: number;
  paymentInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankCode?: string;
  };
  notes?: string;
}
