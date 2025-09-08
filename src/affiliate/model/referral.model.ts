import { Document } from 'mongoose';

export interface IReferral extends Document {
  affiliateId: string;
  referredUserId: string;
  referredUserEmail: string;
  referredUserPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  commissionEarned: number;
  approvedDate?: Date;
  conversionDate?: Date;
  totalOrderValue: number;
  totalOrders: number;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateReferral {
  affiliateCode: string;
  userData: {
    fullName: string;
    phone: string;
    email: string;
  };
}

export interface IUpdateReferral {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  commissionEarned?: number;
  approvedDate?: Date;
  conversionDate?: Date;
  totalOrderValue?: number;
  totalOrders?: number;
  notes?: string;
  rejectionReason?: string;
}
