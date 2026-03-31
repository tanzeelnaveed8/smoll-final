import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './case.entity';
import { Member } from '../member/member.entity';
import { Pet } from '../pet/entities/pet.entity';
import { Vet } from '../vet/entities/vet.entity';
import { SocketModule } from '../socket/socket.module';
import { PetModule } from '../pet/pet.module';
import { PartnerModule } from '../partner/partner.module';
import { CaseMemberController } from './controllers/case.member.controller';
import { CaseMemberService } from './services/case.member.service';
import { CaseVetService } from './services/case.vet.service';
import { CaseVetController } from './controllers/case.vet.controller';
import { CasePartnerService } from './services/case.partner.service';
import { CasePartnerController } from './controllers/case.partner.controller';
import { CaseAdminController } from './controllers/case.admin.controller';
import { CaseAdminService } from './services/case.admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Case, Member, Pet, Vet]),
    SocketModule,
    PetModule,
    forwardRef(() => PartnerModule),
  ],
  controllers: [
    CaseMemberController,
    CaseVetController,
    CasePartnerController,
    CaseAdminController,
  ],
  providers: [
    CaseMemberService,
    CaseVetService,
    CasePartnerService,
    CaseAdminService,
  ],
  exports: [
    CaseMemberService,
    CaseVetService,
    CasePartnerService,
    CaseAdminService,
  ],
})
export class CaseModule {}
