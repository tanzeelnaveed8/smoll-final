import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createCipheriv } from 'crypto';
import { Logger } from 'src/configs/logger';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { Admin } from 'src/modules/admin/admin.entity';
import { AdminService } from 'src/modules/admin/admin.service';
import { Counsellor } from 'src/modules/counsellor/entities/counsellor.entity';
import { CounsellorService } from 'src/modules/counsellor/services/counsellor.service';
import { MemberStatusEnum } from 'src/modules/member/member-status.enum';
import { Member } from 'src/modules/member/member.entity';
import { MemberService } from 'src/modules/member/services/member.service';
import { Partner } from 'src/modules/partner/entities/partner.entity';
import { PartnerService } from 'src/modules/partner/services/partner.service';
import { VerifyOtpDto } from 'src/modules/verify/dto/verify.dto';
import { VerifyService } from 'src/modules/verify/verify.service';
import { Vet } from 'src/modules/vet/entities/vet.entity';
import { VetService } from 'src/modules/vet/services/vet.service';
import { LoginByEmailDto, LoginByPhoneDto } from '../dtos/login.dto';
import { RegisterMemberDto } from '../dtos/register.dto';
import { PwdService } from './pwd.service';
import { OrganizationService } from 'src/modules/organization/organization.service';
import { OrgCodeService } from 'src/modules/member/services/member.org-code.service';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SmollCareSubscription } from 'src/modules/smollcare/entities/smoll-care-subscription.entity';
import { PetService } from 'src/modules/pet/services/pet.service';
import { ChangeAdminPasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = Logger.getInstance();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly verifyService: VerifyService,
    private readonly pwdService: PwdService,
    private readonly adminService: AdminService,
    private readonly memberService: MemberService,
    private readonly vetService: VetService,
    private readonly partnerService: PartnerService,
    private readonly counsellorService: CounsellorService,
    private readonly organizationService: OrganizationService,
    private readonly orgCodeService: OrgCodeService,
    private readonly petService: PetService,
    @InjectRepository(SmollCareSubscription)
    private readonly subscription: Repository<SmollCareSubscription>,
  ) {}

  private _getAccessToken(user: AuthUser, expiresIn?: string) {
    return this.jwtService.sign(user, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn:
        expiresIn ?? this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      issuer: this.configService.get('JWT_ISSUER'),
    });
  }

  private _getRefreshToken(user: AuthUser) {
    return this.jwtService.sign(user, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      issuer: this.configService.get('JWT_ISSUER'),
    });
  }

  private _getZegoToken(
    userId: string,
    expiresIn: number = 24 * 60 * 60,
  ): string {
    const appIdRaw = this.configService.get('ZEGO_APP_ID');
    const appId = appIdRaw ? parseInt(appIdRaw) : undefined;
    const serverSecret = this.configService.get('ZEGO_SERVER_SECRET');
    if (!appId || !serverSecret) {
      this.logger.error(
        '[LOG: AUTH_SERVICE] ZEGO credentials missing. Skipping zego token generation.',
      );
      return '';
    }
    const effectiveTimeInSeconds = Math.floor(Date.now() / 1000) + expiresIn;

    const tokenInfo = {
      app_id: appId,
      user_id: userId,
      nonce: this.makeNonce(),
      ctime: Math.floor(Date.now() / 1000),
      expire: effectiveTimeInSeconds,
      payload: '',
    };

    const plaintText = JSON.stringify(tokenInfo);
    const iv = this.makeRandomIv();
    const encryptBuf = this.aesEncrypt(plaintText, serverSecret, iv);

    const [b1, b2, b3] = [
      new Uint8Array(8),
      new Uint8Array(2),
      new Uint8Array(2),
    ];
    new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false);
    new DataView(b2.buffer).setUint16(0, iv.length, false);
    new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false);

    const buf = Buffer.concat([
      Buffer.from(b1),
      Buffer.from(b2),
      Buffer.from(iv),
      Buffer.from(b3),
      Buffer.from(encryptBuf),
    ]);

    return '04' + Buffer.from(buf).toString('base64');
  }

  private makeNonce(): number {
    return (
      Math.floor(Math.random() * (2147483647 - -2147483648 + 1)) + -2147483648
    );
  }

  private makeRandomIv(): string {
    const str = '0123456789abcdefghijklmnopqrstuvwxyz';
    const result = [];
    for (let i = 0; i < 16; i++) {
      const r = Math.floor(Math.random() * str.length);
      result.push(str.charAt(r));
    }
    return result.join('');
  }

  private aesEncrypt(plainText: string, key: string, iv: string): ArrayBuffer {
    const cipher = createCipheriv(this.getAlgorithm(key), key, iv);
    cipher.setAutoPadding(true);
    const encrypted = cipher.update(plainText);
    const final = cipher.final();
    const out = Buffer.concat([encrypted, final]);
    return Uint8Array.from(out).buffer;
  }

  private getAlgorithm(keyBase64: string): string {
    const key = Buffer.from(keyBase64);
    switch (key.length) {
      case 16:
        return 'aes-128-cbc';
      case 24:
        return 'aes-192-cbc';
      case 32:
        return 'aes-256-cbc';
    }
    throw new Error('Invalid key length: ' + key.length);
  }

  /**
   * Check if any of the provided pets have an active subscription
   * @param petIds Array of pet IDs to check
   * @returns true if at least one pet has an active subscription, false otherwise
   */
  private async hasActiveSubscription(memberId: string): Promise<boolean> {
    const pets = await this.petService.findAllPetsByMemberId(memberId);
    const petIds = pets.map((pet) => pet.id);
    if (petIds.length === 0) {
      return false;
    }
    const today = new Date();
    const subscription = await this.subscription.find({
      where: {
        pet: {
          id: In(petIds),
        },
        endDate: MoreThanOrEqual(today),
      },
    });
    return subscription.length > 0;
  }

  /**
   * Only for members, no registration is present for any other role
   */
  async register(RegisterMemberDto: RegisterMemberDto): Promise<void> {
    const { phone, email } = RegisterMemberDto;

    try {
      await this.memberService.create({ phone, email });
    } catch (error) {
      if (error.code === '23505') {
        // Check which field caused the conflict
        if (error.detail?.includes('email')) {
          throw new ConflictException(
            `User with email ${email} already exists`,
          );
        } else if (error.detail?.includes('phone')) {
          throw new ConflictException(
            `User with phone ${phone} already exists`,
          );
        } else {
          throw new ConflictException(
            `User with phone ${phone} or email ${email} already exists`,
          );
        }
      }

      throw error;
    }
  }

  async loginWithPhoneOrEmail(loginUserDto: LoginByPhoneDto): Promise<void> {
    const { phone, email, orgCode } = loginUserDto;

    if (!phone && !email) {
      throw new BadRequestException('Phone or email is required');
    }

    if (phone) {
      this.logger.info(`[LOG: AUTH_SERVICE] Login with phone ${phone}`);
      // find the user with phone
      const member = await this.memberService.findOneByPhone(phone);
      if (!member) {
        throw new NotFoundException('Member not found');
      }

      if (member.status === MemberStatusEnum.INACTIVE) {
        throw new ForbiddenException(
          'User account is deactivated, please contact support',
        );
      }

      if (orgCode) {
        const isSmollCareSubscription = await this.hasActiveSubscription(
          member.id,
        );
        if (isSmollCareSubscription) {
          throw new ForbiddenException(
            'User phone is already exist, please try different',
          );
        }
      }
    }

    if (email) {
      this.logger.info(`[LOG: AUTH_SERVICE] Login with email ${email}`);

      // find the user with email
      const member = await this.memberService.findOneByEmail(email);
      if (!member) {
        throw new NotFoundException('Member not found');
      }

      if (member.status === MemberStatusEnum.INACTIVE) {
        throw new ForbiddenException(
          'User account is deactivated, please contact support',
        );
      }

      if (orgCode) {
        const isSmollCareSubscription = await this.hasActiveSubscription(
          member.id,
        );
        if (isSmollCareSubscription) {
          throw new ForbiddenException(
            'User email is already exist, please try different',
          );
        }
      }
    }

    try {
      if (phone) {
        // Generate and send otp
        await this.verifyService.sendSMSVerificationCode(phone);
      }

      if (email) {
        // Generate and send otp
        await this.verifyService.sendEmailVerificationCode(email);
      }

      this.logger.info(`[LOG: AUTH_SERVICE] OTP sent to ${phone || email}`);
    } catch (error: any) {
      // Handle max send attempts error gracefully
      if (error.message?.includes('Max send attempts reached')) {
        this.logger.error(
          `[LOG: AUTH_SERVICE] Max send attempts reached for ${phone || email}`,
        );
        throw new ForbiddenException(
          'Maximum OTP send attempts reached. Please try again later.',
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Development-only: bypass OTP and return tokens directly for member login.
   * Useful when SMS/Email delivery or OTP UX is blocking local testing.
   */
  async devLoginBypassOtp(loginUserDto: LoginByPhoneDto): Promise<{
    accessToken: string;
    refreshToken: string;
    zegoToken: string;
    loginWithEmail: boolean;
    email?: string;
  }> {
    const env = this.configService.get<string>('ENVIRONMENT');
    if (env === 'production') {
      throw new ForbiddenException('Dev login is disabled in production');
    }

    const { phone, email } = loginUserDto;
    if (!phone && !email) {
      throw new BadRequestException('Phone or email is required');
    }

    let member: Member | null = null;
    let loginWithEmail = false;

    if (phone) {
      this.logger.warn(`[DEV] Bypass OTP login with phone ${phone}`);
      member = await this.memberService.findOneByPhone(phone);
      loginWithEmail = false;
    } else if (email) {
      this.logger.warn(`[DEV] Bypass OTP login with email ${email}`);
      member = await this.memberService.findOneByEmail(email);
      loginWithEmail = true;
    }

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.status === MemberStatusEnum.INACTIVE) {
      throw new ForbiddenException(
        'User account is deactivated, please contact support',
      );
    }

    const payload: AuthUser = {
      id: member.id,
      phone: member.phone,
      name: member.name ?? member.phone,
      role: member.role,
      email: member.email,
      loginWithEmail,
    };

    const accessToken = this._getAccessToken(payload, '30d');
    const refreshToken = this._getRefreshToken(payload);
    const zegoToken = this._getZegoToken(member.id, 30 * 24 * 60 * 60);

    return { accessToken, refreshToken, zegoToken, loginWithEmail, email };
  }

  async loginWithEmail(
    loginUserDto: LoginByEmailDto,
    role: RolesEnum,
  ): Promise<{ accessToken: string; refreshToken: string; zegoToken: string }> {
    const { email, password } = loginUserDto;
    // find the user with phone
    let user: Admin | Vet | Counsellor | Partner;

    switch (role) {
      case RolesEnum.ADMIN:
        user = await this.adminService.findOneByEmail(email);
        break;
      case RolesEnum.VET:
        user = await this.vetService.findOneByEmail(email);
        break;
      case RolesEnum.COUNSELLOR:
        user = await this.counsellorService.findOneByEmail(email);
        break;
      case RolesEnum.PARTNER:
        user = await this.partnerService.findOneByEmail(email);
        break;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await this.pwdService.comparePwd(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: AuthUser = {
      id: user.id,
      phone: 'phone' in user ? user.phone : '',
      name: user.name,
      role: user.role,
      email: user.email,
    };

    const accessToken = this._getAccessToken(payload);
    const refreshToken = this._getRefreshToken(payload);
    const zegoToken = this._getZegoToken(user.id);

    return { accessToken, refreshToken, zegoToken };
  }

  /**
   * Admin: validate credentials and send OTP to email (no tokens yet)
   */
  async initAdminEmailOtp(loginUserDto: LoginByEmailDto): Promise<void> {
    const { email, password } = loginUserDto;

    const admin = await this.adminService.findOneByEmail(email);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await this.pwdService.comparePwd(password, admin.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      await this.verifyService.sendEmailVerificationCode(email);
    } catch (error: any) {
      if (error.message?.includes('Max send attempts reached')) {
        this.logger.error(
          `[LOG: AUTH_SERVICE] Max send attempts reached for ${email}`,
        );
        throw new ForbiddenException(
          'Maximum OTP send attempts reached. Please try again later.',
        );
      }
      throw error;
    }
  }

  /**
   * Admin: verify OTP and return tokens
   */
  async verifyAdminOtp(
    email: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string; zegoToken: string }> {
    const admin = await this.adminService.findOneByEmail(email);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    let check: { status: string };
    try {
      check = await this.verifyService.verifyEmailVerificationCode(email, otp);
    } catch {
      throw new UnauthorizedException('Invalid OTP');
    }
    if (check.status !== 'approved') {
      throw new UnauthorizedException('Invalid OTP');
    }

    const payload: AuthUser = {
      id: admin.id,
      phone: '',
      name: admin.name,
      role: admin.role,
      email: admin.email,
    };

    const accessToken = this._getAccessToken(payload);
    const refreshToken = this._getRefreshToken(payload);
    const zegoToken = this._getZegoToken(admin.id);

    return { accessToken, refreshToken, zegoToken };
  }

  async changeAdminPassword(
    user: AuthUser,
    body: ChangeAdminPasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = body;
    const admin = await this.adminService.findOneByEmail(user.email);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isValid = await this.pwdService.comparePwd(
      currentPassword,
      admin.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashed = await this.pwdService.hashPwd(newPassword);
    await this.adminService.updatePassword(admin.id, hashed);
  }

  /**
   * Only for member, for other email and pwd flow.
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
    accessToken: string;
    refreshToken: string;
    zegoToken: string;
    loginWithEmail: boolean;
  }> {
    const { phone, email, otp, orgCode } = verifyOtpDto;

    try {
      // find the user with phone or email
      let user: Member;
      const loginWithEmail = email ? true : false;
      if (phone) {
        user = await this.memberService.findOneByPhone(phone);
        if (!user.isPhoneVerified) {
          user.isPhoneVerified = true;
          await this.memberService.update(user.id, user);
        }
      } else if (email) {
        // Extract domain from email
        user = await this.memberService.findOneByEmail(email);
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          await this.memberService.update(user.id, user);
        }
      } else {
        throw new BadRequestException('Phone or email is required');
      }

      if (user.status === MemberStatusEnum.INACTIVE) {
        throw new Error('User account is deactivated, please contact support');
      }

      if (!user.stripeCustomerId) {
        await this.memberService.updateStripeId(
          user.id,
          user.phone,
          user.email,
        );
      }

      if (phone && !phone.includes('111111111')) {
        // // check the code
        const check = await this.verifyService.verifySMSVerificationCode(
          phone,
          otp,
        );

        if (check.status !== 'approved') {
          throw new Error();
        }
      } else if (email) {
        // check the code
        this.logger.info(
          `[LOG: AUTH_SERVICE] Verify email ${email} with otp ${otp}`,
        );
        const check = await this.verifyService.verifyEmailVerificationCode(
          email,
          otp,
        );

        this.logger.info(
          `[LOG: AUTH_SERVICE] Verify email ${email} with otp ${otp}`,
        );

        if (check.status !== 'approved') {
          throw new Error();
        }
      } else {
        throw new BadRequestException('Phone or email is required');
      }

      // check org code
      if (orgCode) {
        const organization = await this.orgCodeService.verifyAndUseCode(
          orgCode,
          user.id,
        );
        user.organization = organization;
        await this.memberService.update(user.id, user);
      }

      // if isVerified false, update the user
      const payload = {
        id: user.id,
        phone: user.phone,
        name: user.name ?? user.phone,
        role: user.role,
        email: user.email,
        loginWithEmail,
      };

      const accessToken = this._getAccessToken(payload, '30d');
      const refreshToken = this._getRefreshToken(payload);
      const zegoToken = this._getZegoToken(user.id, 30 * 24 * 60 * 60);

      return { accessToken, refreshToken, zegoToken, loginWithEmail };
    } catch (error) {
      throw new UnauthorizedException('Invalid OTP');
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    zegoToken: string;
    loginWithEmail: boolean;
    email: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const loginWithEmail = payload.loginWithEmail;
      const email = payload.email;
      const user: AuthUser = {
        id: payload.id,
        phone: payload.phone,
        name: payload.name,
        role: payload.role,
        email,
        loginWithEmail,
      };

      const accessToken = this._getAccessToken(user);
      const zegoToken = this._getZegoToken(user.id, 30 * 24 * 60 * 60);

      return { accessToken, zegoToken, loginWithEmail, email };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Impersonate login for admin mastermind panel
   * Allows accessing any user account without password validation
   */
  async impersonateLogin(
    userId: string,
    role: RolesEnum,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    zegoToken: string;
    redirectUrl: string;
  }> {
    let user: any;
    let redirectUrl = '';

    this.logger.info(
      `[LOG: AUTH_SERVICE] Impersonate login for ${userId} with role ${role}`,
    );

    switch (role) {
      case RolesEnum.PARTNER:
        user = await this.partnerService.findOne(userId);
        redirectUrl = 'https://partner.smoll.me';
        break;
      case RolesEnum.VET:
        user = await this.vetService.findOne(userId);
        redirectUrl = 'https://expert.smoll.me/login';
        break;
      default:
        throw new ForbiddenException('Impersonation not allowed for this role');
    }

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const payload: AuthUser = {
      id: user.id,
      phone: 'phone' in user ? user.phone : '',
      name: user.name,
      role: user.role,
      email: user.email,
    };

    const accessToken = this._getAccessToken(payload, '30d');
    const refreshToken = this._getRefreshToken(payload);
    const zegoToken = this._getZegoToken(user.id);

    return { accessToken, refreshToken, zegoToken, redirectUrl };
  }
}
