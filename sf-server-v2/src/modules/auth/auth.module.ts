import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from '../admin/admin.module';
import { CounsellorModule } from '../counsellor/counsellor.module';
import { MemberModule } from '../member/member.module';
import { OrgCodeService } from '../member/services/member.org-code.service';
import { OrganizationModule } from '../organization/organization.module';
import { PartnerModule } from '../partner/partner.module';
import { PetService } from '../pet/services/pet.service';
import { VetModule } from '../vet/vet.module';
import { AuthAdminController } from './auth.admin.controller';
import { AuthCounsellorController } from './auth.counsellor.controller';
import { AuthMastermindController } from './auth.mastermind.controller';
import { AuthMemberController } from './auth.member.controller';
import { AuthPartnerController } from './auth.partner.controller';
import { AuthVetController } from './auth.vet.controller';
import { AuthService } from './services/auth.service';
import { PwdService } from './services/pwd.service';
import { JWTStrategy } from './strategies/jwt.strategy';
import { SmollCareModule } from '../smollcare/smoll-care.module';
import { PetModule } from '../pet/pet.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    MemberModule,
    VetModule,
    AdminModule,
    CounsellorModule,
    PartnerModule,
    OrganizationModule,
    forwardRef(() => SmollCareModule),
    PetModule,
  ],
  controllers: [
    AuthAdminController,
    AuthMemberController,
    AuthVetController,
    AuthCounsellorController,
    AuthPartnerController,
    AuthMastermindController,
  ],
  providers: [AuthService, PwdService, JWTStrategy, OrgCodeService, PetService],
  exports: [PassportModule, PwdService],
})
export class AuthModule {}
