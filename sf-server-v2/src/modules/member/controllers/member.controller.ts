import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from '../../../guards/role/role.enum';
import { MemberService } from '../services/member.service';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { UpdateMemberPayloadDto, UpdateMemberResDto } from '../dtos/update.dto';
import { plainToInstance } from 'class-transformer';
import {
  VerifyEmailDto,
  VerifyPhoneDto,
} from 'src/modules/verify/dto/verify.dto';
import { RoleGuard } from 'src/guards/role/role.guard';
import { PaginationQueryDto } from 'src/utils/pagination';
import { formatNumberWithDashes } from '../member.util';
import { FindOneMemberResDto } from '../dtos/find.admin.dto';
import { SubscriptionDto } from '../dtos/find.dto';
import { OrganizationService } from 'src/modules/organization/organization.service';
import { OrgCodeService } from '../services/member.org-code.service';
import { Logger } from 'src/configs/logger';
import { Organization } from 'src/modules/organization/entities/organization.entity';
import {
  MemberPublicProfileResDto,
  MemberSummaryResDto,
  FindMembersByIdsQueryDto,
} from '../dtos/find.dto';
import { AddGroupChatIdDto } from '../dtos/add-group-chat-id.dto';

@ApiTags('Member: Member Role')
@ApiCookieAuth()
@Controller('/members')
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class MemberController {
  private readonly logger = Logger.getInstance();
  constructor(
    private readonly memberService: MemberService,
    private readonly organizationService: OrganizationService,
    private readonly orgCodeService: OrgCodeService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/envs')
  getEnvs(): {
    ONESIGNAL_APP_ID: string;
    STRIPE_PUBLISHABLE_KEY: string;
    ZEGO_APP_ID: string;
    ZEGO_APP_SIGN: string;
    ZEGO_SERVER_SECRET: string;
  } {
    const stripeKey = this.configService.get('STAGING_STRIPE_PUBLISHABLE_KEY', '') ||
                      this.configService.get('STRIPE_PUBLISHABLE_KEY', '');

    return {
      ONESIGNAL_APP_ID: this.configService.get('ONESIGNAL_APP_ID', ''),
      STRIPE_PUBLISHABLE_KEY: stripeKey,
      ZEGO_APP_ID: this.configService.get('ZEGO_APP_ID', ''),
      ZEGO_APP_SIGN: this.configService.get('ZEGO_APP_SIGN', ''),
      ZEGO_SERVER_SECRET: this.configService.get('ZEGO_SERVER_SECRET', ''),
    };
  }

  @Get('/me')
  async findMe(@GetUser() user: AuthUser): Promise<FindOneMemberResDto> {
    const _user = await this.memberService.findOne(user.id);

    const careId = formatNumberWithDashes(_user.careId, 6);
    // Determine subscription type and validity
    const subscriptionUser = await this.determineSubscription(
      user,
      _user.organization,
    );

    return plainToInstance(
      FindOneMemberResDto,
      {
        ..._user,
        careId,
        subscription: subscriptionUser,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Get('/summary')
  async findMembersSummary(
    @Query(new ValidationPipe({ transform: true }))
    query: FindMembersByIdsQueryDto,
  ): Promise<MemberSummaryResDto[]> {
    const members = await this.memberService.findBasicDetailsByIdsCached(
      query.ids,
    );
    return plainToInstance(MemberSummaryResDto, members, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Determines the user's subscription type and validity
   * Priority: SmallCare > SmallVet > SmallBasic
   */
  private async determineSubscription(
    user: AuthUser,
    organization?: Organization,
  ): Promise<SubscriptionDto> {
    const { SubscriptionPlanType } = await import('../dtos/find.dto');

    // Default subscription is SmallBasic
    const subscription = {
      type: SubscriptionPlanType.SMOLL_BASIC,
      validUntil: null,
      isActive: true,
      organizationName: null,
      organizationId: null,
      organizationProfileImg: null,
      groupChat: null,
    };

    try {
      // 1️⃣ Check for SmallCare subscription (highest priority)
      const smallCareSubscription =
        await this.memberService.findSmallCareSubscription(user.id);

      // 2️⃣ Check for valid linked organization (before email domain)
      const usedCode = await this.orgCodeService.findUsedCodeByMember(user.id);

      if (smallCareSubscription && smallCareSubscription.validUntil) {
        // Check if user also has SmollVet access to include organization details
        let smollVetOrgDetails = {
          organizationName: null,
          organizationId: null,
          organizationProfileImg: null,
          groupChat: null,
        };

        // Check linked organization (domain access)
        if (
          organization &&
          organization.isSmollVetAccessValid &&
          organization.isSmollVetAccessValid() &&
          !usedCode &&
          (organization as any).domainAccessEnabled === true
        ) {
          const isEnabled =
            (organization as any).domainGroupChatEnabled === true;
          smollVetOrgDetails = {
            organizationName: organization.organizationName || null,
            organizationId: organization.id || null,
            organizationProfileImg: organization.profileImg || null,
            groupChat: {
              id: isEnabled ? organization.domainGroupChatId || null : null,
              loginMethod: 'domain' as const,
              isEnabled,
            },
          };
        }
        // Check org code access
        else if (
          usedCode &&
          usedCode.usedAt &&
          (usedCode.organization as any).codeAccessEnabled === true
        ) {
          let isCodeActive = true;
          if (
            usedCode.maxUsageMonths !== null &&
            usedCode.maxUsageMonths !== undefined
          ) {
            const expiry = new Date(usedCode.usedAt);
            expiry.setMonth(expiry.getMonth() + usedCode.maxUsageMonths);
            isCodeActive = new Date() <= expiry;
          }

          if (isCodeActive && usedCode.organization) {
            const isEnabled =
              (usedCode.organization as any).codeGroupChatEnabled === true;
            smollVetOrgDetails = {
              organizationName: usedCode.organization.organizationName || null,
              organizationId: usedCode.organization.id || null,
              organizationProfileImg: usedCode.organization.profileImg || null,
              groupChat: {
                id: isEnabled
                  ? usedCode.organization.codeGroupChatId || null
                  : null,
                loginMethod: 'code' as const,
                isEnabled,
              },
            };
          }
        }
        // Check email domain access
        else if (user.loginWithEmail) {
          const domain = user.email.split('@')[1];
          if (domain) {
            const hasValidOrganization =
              await this.organizationService.findByDomain(domain);
            if (
              hasValidOrganization &&
              hasValidOrganization.isSmollVetAccessValid() &&
              (hasValidOrganization as any).domainAccessEnabled === true
            ) {
              const isEnabled =
                (hasValidOrganization as any).domainGroupChatEnabled === true;
              smollVetOrgDetails = {
                organizationName: hasValidOrganization.organizationName || null,
                organizationId: hasValidOrganization.id || null,
                organizationProfileImg: hasValidOrganization.profileImg || null,
                groupChat: {
                  id: isEnabled
                    ? hasValidOrganization.domainGroupChatId || null
                    : null,
                  loginMethod: 'domain' as const,
                  isEnabled,
                },
              };
            }
          }
        }

        return {
          type: SubscriptionPlanType.SMOLL_CARE,
          validUntil: smallCareSubscription.validUntil,
          isActive: true,
          ...smollVetOrgDetails,
        };
      }
      if (
        organization &&
        organization.isSmollVetAccessValid &&
        organization.isSmollVetAccessValid() &&
        !usedCode &&
        (organization as any).domainAccessEnabled === true
      ) {
        const isEnabled = (organization as any).domainGroupChatEnabled === true;
        const groupChat = {
          id: isEnabled ? organization.domainGroupChatId || null : null,
          loginMethod: 'domain' as const,
          isEnabled,
        };

        return {
          type: SubscriptionPlanType.SMOLL_VET,
          validUntil: organization.smollVetAccessEndDate || null,
          isActive: organization.smollVetIsActive || false,
          organizationName: organization.organizationName || null,
          organizationId: organization.id || null,
          organizationProfileImg: organization.profileImg || null,
          groupChat,
        };
      }

      // 3️⃣ Check for active org code used by this member (independent of domain)
      if (
        usedCode &&
        usedCode.usedAt &&
        (usedCode.organization as any).codeAccessEnabled === true
      ) {
        let isCodeActive = true;
        let validUntil: Date | null = null;
        if (
          usedCode.maxUsageMonths !== null &&
          usedCode.maxUsageMonths !== undefined
        ) {
          const expiry = new Date(usedCode.usedAt);
          expiry.setMonth(expiry.getMonth() + usedCode.maxUsageMonths);
          validUntil = expiry;
          isCodeActive = new Date() <= expiry;
        } else {
          validUntil = null;
          isCodeActive = true;
        }

        if (isCodeActive && usedCode.organization) {
          const isEnabled =
            (usedCode.organization as any).codeGroupChatEnabled === true;
          const groupChat = {
            id: isEnabled
              ? usedCode.organization.codeGroupChatId || null
              : null,
            loginMethod: 'code' as const,
            isEnabled,
          };

          return {
            type: SubscriptionPlanType.SMOLL_VET,
            validUntil,
            isActive: true,
            organizationName: usedCode.organization.organizationName || null,
            organizationId: usedCode.organization.id || null,
            organizationProfileImg: usedCode.organization.profileImg || null,
            groupChat,
          };
        }
      }

      // 4️⃣ Fallback: check by email domain (if login with email)
      if (user.loginWithEmail) {
        const domain = user.email.split('@')[1];
        if (domain) {
          const hasValidOrganization =
            await this.organizationService.findByDomain(domain);
          if (
            hasValidOrganization &&
            hasValidOrganization.isSmollVetAccessValid() &&
            (hasValidOrganization as any).domainAccessEnabled === true
          ) {
            const isEnabled =
              (hasValidOrganization as any).domainGroupChatEnabled === true;
            const groupChat = {
              id: isEnabled
                ? hasValidOrganization.domainGroupChatId || null
                : null,
              loginMethod: 'domain' as const,
              isEnabled,
            };

            return {
              type: SubscriptionPlanType.SMOLL_VET,
              validUntil: hasValidOrganization.smollVetAccessEndDate || null,
              isActive: hasValidOrganization.smollVetIsActive || false,
              organizationName: hasValidOrganization.organizationName || null,
              organizationId: hasValidOrganization.id || null,
              organizationProfileImg: hasValidOrganization.profileImg || null,
              groupChat,
            };
          }
        }
      }
      // 5️⃣ Default fallback
      return { ...subscription, groupChat: null };
    } catch (error) {
      console.error('Error determining subscription:', error);
      return { ...subscription, groupChat: null };
    }
  }

  @Get('/profile/:id')
  async findPublicProfile(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<MemberPublicProfileResDto> {
    const profile = await this.memberService.findPublicProfile(user, id);
    return plainToInstance(MemberPublicProfileResDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/appointments')
  async findAllAppointments(
    @GetUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.memberService.findAllAppointments(user, query);
  }

  @Get('/appointments/:id')
  async findAppointment(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Query('type') type: 'in-clinic' | 'video',
  ) {
    return await this.memberService.findOneAppointment(user, id, type);
  }

  @Patch('/me')
  async update(
    @GetUser() user: AuthUser,
    @Body() body: UpdateMemberPayloadDto,
  ): Promise<UpdateMemberResDto> {
    const _user = await this.memberService.update(user.id, body);

    return plainToInstance(UpdateMemberResDto, _user, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/send-email-verification')
  async sendEmailVerification(@GetUser() user: AuthUser): Promise<void> {
    return await this.memberService.sendEmailVerification(user);
  }

  @Post('/send-phone-verification')
  async sendPhoneVerification(@GetUser() user: AuthUser): Promise<void> {
    return await this.memberService.sendPhoneVerification(user);
  }

  @Post('/verify-email')
  async verifyEmail(
    @GetUser() user: AuthUser,
    @Body() body: VerifyEmailDto,
  ): Promise<void> {
    return await this.memberService.verifyEmail(user, body);
  }

  @Post('/verify-phone')
  async verifyPhone(
    @GetUser() user: AuthUser,
    @Body() body: VerifyPhoneDto,
  ): Promise<void> {
    return await this.memberService.verifyPhone(user, body);
  }

  @Post('/me/deactivate')
  async deactivate(@GetUser() user: AuthUser): Promise<void> {
    return await this.memberService.deactivate(user);
  }

  @Post('/me/clear-popups')
  async clearPopups(
    @GetUser() user: AuthUser,
    @Body('type') type: 'emergency' | 'quotation',
  ): Promise<void> {
    return await this.memberService.clearMemberPopups(user, type);
  }

  @Post('/organization/group-chat-id')
  async addGroupChatId(
    @GetUser() user: AuthUser,
    @Body() body: AddGroupChatIdDto,
  ): Promise<void> {
    const member = await this.memberService.findOne(user.id);
    let organizationId: string | null = null;
    if (!member.organization && body.type === 'code') {
      throw new BadRequestException(
        'Member does not belong to an organization',
      );
    } else if (body.type === 'domain') {
      const domain = user.email.split('@')[1];
      if (!domain) {
        throw new BadRequestException('Invalid email domain');
      }
      const organizationDetails =
        await this.organizationService.findByDomain(domain);
      if (!organizationDetails) {
        throw new BadRequestException('No organization found with this domain');
      }
      organizationId = organizationDetails.id;
    }
    await this.organizationService.addGroupChatId(
      organizationId || member.organization.id,
      body.chatId,
      body.type,
    );
  }
}
