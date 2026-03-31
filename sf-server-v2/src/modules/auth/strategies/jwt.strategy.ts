import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { AdminService } from 'src/modules/admin/admin.service';
import { CounsellorService } from 'src/modules/counsellor/services/counsellor.service';
import { MemberService } from 'src/modules/member/services/member.service';
import { PartnerService } from 'src/modules/partner/services/partner.service';
import { VetService } from 'src/modules/vet/services/vet.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly memberService: MemberService,
    private readonly adminService: AdminService,
    private readonly vetService: VetService,
    private readonly configService: ConfigService,
    private readonly counsellorService: CounsellorService,
    private readonly partnerService: PartnerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => request?.cookies?.sfAccessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      issuer: configService.get('JWT_ISSUER'),
    });
  }

  async validate(payload: AuthUser & Record<string, any>): Promise<AuthUser> {
    const { id } = payload;

    let user = null;

    switch (payload.role) {
      case RolesEnum.MEMBER:
        user = await this.memberService.findOne(id);
        break;
      case RolesEnum.ADMIN:
        user = await this.adminService.findOneByEmail(payload.email);
        break;
      case RolesEnum.VET:
        user = await this.vetService.findOneByEmail(payload.email);
        break;
      case RolesEnum.COUNSELLOR:
        user = await this.counsellorService.findOneByEmail(payload.email);
        break;
      case RolesEnum.PARTNER:
        user = await this.partnerService.findOneByEmail(payload.email);
        break;
    }

    if (!user) {
      throw new UnauthorizedException('Unauthorized User!');
    }

    return {
      id: user.id,
      name: user.name ?? user.phone ?? user.email,
      email: user.email,
      phone: user.phone,
      role: user.role,
      loginWithEmail:
        payload.role === RolesEnum.MEMBER ? payload.loginWithEmail : false,
    };
  }
}
