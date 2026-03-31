import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmollCareService } from './smoll-care.service';
import { SmollCareController } from './controllers/smoll-care.controller';
import { SmollCarePlan } from './entities/smoll-care-plan.entity';
import { SmollCareBenefit } from './entities/smoll-care-benefit.entity';
import { SmollCareBenefitUsage } from './entities/smoll-care-benefit-usage.entity';
import { PaymentLog } from '../payment-log/payment-log.entity';
import { Member } from '../member/member.entity';
import { Pet } from '../pet/entities/pet.entity';
import { Partner } from '../partner/entities/partner.entity'; // Added for benefit usage validation if needed
import { Case } from '../case/case.entity'; // Added for benefit usage validation if needed
import { StripeModule } from '../stripe/stripe.module'; // Import StripeModule
import { SmollCarePartnerMemberController } from './controllers/smoll-care.partner.controller';
import { PetModule } from '../pet/pet.module';
import { SmollCareMemberService } from './services/smoll-care.member.service';
import { SmollCarePartnerService } from './services/smoll-care.partner.service';
import { SmollCareMemberController } from './controllers/smoll-care.member.controller';
import { BullModule } from '@nestjs/bullmq';
import { SmollCareSubscription } from './entities/smoll-care-subscription.entity';
import * as dotenv from 'dotenv';

dotenv.config();
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SmollCarePlan,
      SmollCareSubscription,
      SmollCareBenefit,
      SmollCareBenefitUsage,
      PaymentLog, // Service uses PaymentLogRepository
      Member, // Service uses MemberRepository (e.g. for createSubscription)
      Pet, // Service uses PetRepository (e.g. for assignLicense)
      Partner, // Potentially for validating partnerId in useBenefit
      Case, // Potentially for validating caseId in useBenefit
    ]),
    StripeModule, // Add StripeModule to imports
    forwardRef(() => PetModule),
    ...(REDIS_ENABLED
      ? [
          BullModule.registerQueue({
            name: 'subscription-expiry',
          }),
        ]
      : []),
  ],
  controllers: [
    SmollCareController,
    SmollCarePartnerMemberController,
    SmollCareMemberController,
  ],
  providers: [
    SmollCareService,
    SmollCareMemberService,
    SmollCarePartnerService,
    SmollCareSubscription
  ],
  exports: [SmollCareService, SmollCareSubscription], // Export if other modules need to inject SmollCareService
})
export class SmollCareModule { }
