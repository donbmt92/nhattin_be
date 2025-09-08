import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Affiliate, AffiliateSchema } from './schemas/affiliate.schema';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import { CommissionTransaction, CommissionSchema } from './schemas/commission.schema';
import { AffiliateLink, AffiliateLinkSchema } from './schemas/affiliate-link.schema';
import { AffiliateController } from './affiliate.controller';
import { ReferralController } from './referral.controller';
import { CommissionController } from './commission.controller';
import { AffiliateLinkController, AffiliateRedirectController } from './affiliate-link.controller';
import { AffiliateService } from './affiliate.service';
import { AffiliateLinkService } from './affiliate-link.service';
import { FraudPreventionGuard } from './guards/fraud-prevention.guard';
import { AffiliateRepo } from './affiliate.repo';
import { CommissionService } from './commission.service';
import { ReferralService } from './referral.service';
import { CleanupExpiredLinksTask } from './tasks/cleanup-expired-links.task';
import { UsersModule } from '../users/users.module';
import { ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: CommissionTransaction.name, schema: CommissionSchema },
      { name: AffiliateLink.name, schema: AffiliateLinkSchema },
      { name: 'Product', schema: ProductSchema }
    ]),
    UsersModule
  ],
  controllers: [AffiliateController, ReferralController, CommissionController, AffiliateLinkController, AffiliateRedirectController],
  providers: [
    AffiliateService, 
    AffiliateLinkService,
    AffiliateRepo,
    CommissionService,
    ReferralService,
    FraudPreventionGuard,
    CleanupExpiredLinksTask
  ],
  exports: [AffiliateService, AffiliateLinkService, CommissionService, ReferralService, FraudPreventionGuard]
})
export class AffiliateModule {}
