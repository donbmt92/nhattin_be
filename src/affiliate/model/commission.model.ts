import { Document } from 'mongoose';

export interface ICommissionTransaction extends Document {
  affiliateId: string;
  orderId: string;
  referralId: string;
  orderAmount: number;
  commission: number;
  commissionRate: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paidDate?: Date;
  paymentMethod?: 'QR_CODE' | 'BANK_TRANSFER' | 'WALLET' | 'CASH';
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCommission {
  affiliateId: string;
  orderId: string;
  referralId: string;
  orderAmount: number;
  commission: number;
  commissionRate: number;
  paymentMethod?: 'QR_CODE' | 'BANK_TRANSFER' | 'WALLET' | 'CASH';
  notes?: string;
}

export interface IUpdateCommission {
  status?: 'PENDING' | 'PAID' | 'CANCELLED';
  paidDate?: Date;
  paymentMethod?: 'QR_CODE' | 'BANK_TRANSFER' | 'WALLET' | 'CASH';
  paymentReference?: string;
  notes?: string;
}
