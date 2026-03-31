import { Module } from '@nestjs/common';
import { PartnerService } from './services/partner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerCost } from './entities/partner.cost.entity';
import { Partner } from './entities/partner.entity';
import { PartnerController } from './controllers/partner.controller';
import { PartnerAdminService } from './services/partner.admin.service';
import { PartnerAdminController } from './controllers/partner.admin.controller';
import { PartnerVet } from './entities/partner.vet.entity';
import { VetAvailability } from '../vet/entities/vet.availability.entity';
import { PartnerServices } from './entities/partner.services.entity';
import { PartnerSpeciality } from './entities/partner.speciality.entity';
import { PartnerVetService } from './services/partner.vet.service';
import { PartnerVetController } from './controllers/partner.vet.controller';
import { PartnerMemberController } from './controllers/partner.member.controller';
import { PartnerMemberService } from './services/partner.member.service';
import { PartnerBooking } from './entities/partner.booking.entity';
import { BullModule } from '@nestjs/bullmq';
import { StripeModule } from '../stripe/stripe.module';
import { CaseModule } from '../case/case.module';
import { ProductModule } from '../product/product.module';
import * as dotenv from 'dotenv';

dotenv.config();
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forFeature([
      Partner,
      PartnerVet,
      PartnerCost,
      PartnerServices,
      VetAvailability,
      PartnerSpeciality,
      PartnerBooking,
    ]),
    StripeModule,
    CaseModule,
    ...(REDIS_ENABLED
      ? [
          BullModule.registerQueue({
            name: 'partner',
          }),
        ]
      : []),
  ],
  controllers: [
    PartnerController,
    PartnerVetController,
    PartnerAdminController,
    PartnerMemberController,
  ],
  providers: [
    PartnerService,
    PartnerMemberService,
    PartnerVetService,
    PartnerAdminService,
  ],
  exports: [PartnerService, PartnerMemberService],
})
export class PartnerModule {}
