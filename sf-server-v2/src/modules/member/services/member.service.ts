import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { RegisterMemberDto } from 'src/modules/auth/dtos/register.dto';
import { BookingStatusEnum } from 'src/modules/partner/booking-status.enum';
import { PartnerBooking } from 'src/modules/partner/entities/partner.booking.entity';
import { StripeService } from 'src/modules/stripe/stripe.service';
import {
  VerifyEmailDto,
  VerifyPhoneDto,
} from 'src/modules/verify/dto/verify.dto';
import { VerifyService } from 'src/modules/verify/verify.service';
import { VetConsultation } from 'src/modules/vet/entities/vet.consultation.entity';
import { PaginationQueryDto } from 'src/utils/pagination';
import { ILike, Repository } from 'typeorm';
import { UpdateMemberPayloadDto } from '../dtos/update.dto';
import { Member } from '../member.entity';
import { ConsultationStatusEnum } from 'src/modules/vet/enums/consultation-status.enum';
import { PartnerMemberService } from 'src/modules/partner/services/partner.member.service';
import { VetMemberService } from 'src/modules/vet/services/vet.member.service';
import { Logger } from 'src/configs/logger';
import { MemberStatusEnum } from '../member-status.enum';
import { NotificationService } from 'src/modules/notification/notification.service';
import { accountDeactivationTemplate } from 'src/utils/emailTemplate';
import { CaseMemberService } from 'src/modules/case/services/case.member.service';
import { RedisService } from 'src/modules/redis/redis.service';
import { Organization } from 'src/modules/organization/entities/organization.entity';
import { SubscriptionStatus } from 'src/modules/smollcare/enums/subscription-status.enum';
import { FindFileResDto } from 'src/modules/file/dto/find.dto';

@Injectable()
export class MemberService {
  private readonly logger = Logger.getInstance();
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(PartnerBooking)
    private readonly partnerBookingRepo: Repository<PartnerBooking>,
    @InjectRepository(VetConsultation)
    private readonly vetConsultationRepo: Repository<VetConsultation>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    private readonly verifyService: VerifyService,
    private readonly stripeService: StripeService,
    private readonly partnerService: PartnerMemberService,
    private readonly vetService: VetMemberService,
    private readonly notificationService: NotificationService,
    private readonly caseService: CaseMemberService,
    private readonly redisService: RedisService,
  ) { }

  async _getMemberCtaPopups(member: Member) {
    const emergencyPopup = (await this.redisService.getJson(
      `popup-emergency:${member.id}`,
    )) as {
      caseId: string;
      partnerId: string;
      hasPartnerBooking: boolean;
      petName: string;
    } | null;

    const quoteSubmittedPopup = (await this.redisService.getJson(
      `popup-quotation:${member.id}`,
    )) as {
      caseId: string;
      partnerId: string;
      hasPartnerBooking: boolean;
      petName: string;
    } | null;

    return {
      emergency: emergencyPopup,
      quotation: quoteSubmittedPopup,
    };
  }
  /**
   * Finds the SmallCare subscription with the maximum expiry date
   * @param memberId The member ID
   * @returns The subscription details with the maximum expiry date
   */
  async findSmallCareSubscription(
    memberId: string,
  ): Promise<{ validUntil: Date | null }> {
    try {
      const member = await this.memberRepo.findOne({
        where: { id: memberId },
        relations: {
          pets: {
            subscription: {
              plan: true,
            },
          },
        },
      });

      if (!member || !member.pets || member.pets.length === 0) {
        return { validUntil: null };
      }

      const today = new Date();

      // Get all active SmallCare subscriptions
      const activeSubscriptions = member.pets
        .filter(
          (pet) =>
            pet.subscription &&
            pet.subscription.endDate >= today &&
            pet.subscription.status !== SubscriptionStatus.REVOKED &&
            pet.subscription.plan?.name?.toLowerCase().includes('care'),
        )
        .map((pet) => pet.subscription);

      if (activeSubscriptions.length === 0) {
        return { validUntil: null };
      }

      // Find the subscription with the maximum expiry date
      const maxExpirySubscription = activeSubscriptions.reduce(
        (max, current) => (current.endDate > max.endDate ? current : max),
      );
      return { validUntil: maxExpirySubscription.endDate };
    } catch (error) {
      this.logger.error('Error finding SmallCare subscription', error);
      return { validUntil: null };
    }
  }

  async clearMemberPopups(member: AuthUser, type: 'emergency' | 'quotation') {
    this.logger.info(
      `[LOG: MEMBER_SERVICE] Clearing ${type} popup for member ${member.id}`,
    );

    const deleted = await this.redisService.delete(
      `popup-${type}:${member.id}`,
    );

    this.logger.info(
      `[LOG: MEMBER_SERVICE] Deleted ${deleted} ${type} popup for member ${member.id}`,
    );
  }

  async findOne(
    id: string,
  ): Promise<Member & { navNotif: { newQuotation: number } }> {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: ['pets', 'organization'],
    });

    const quotationCounts =
      await this.caseService.findCaseNewQuotationsCount(member);

    if (!member) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }

    const popups = await this._getMemberCtaPopups(member);

    return Object.assign(member, {
      navNotif: {
        newQuotation: quotationCounts,
      },
      popups,
    });
  }

  async findPublicProfile(
    viewer: AuthUser,
    memberId: string,
  ): Promise<{
    id: string;
    name: string | null;
    profileImg: FindFileResDto | null;
    pets: { name: string; photos: FindFileResDto[] }[];
  }> {
    const viewerMember = await this.memberRepo.findOne({
      where: { id: viewer.id },
      relations: ['organization'],
    });

    if (!viewerMember) {
      throw new NotFoundException(`Member with id "${viewer.id}" not found`);
    }

    const targetMember = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['pets', 'organization'],
    });

    if (!targetMember) {
      throw new NotFoundException(`Member with id "${memberId}" not found`);
    }

    // const viewerOrg = viewerMember.organization;
    // const targetOrg = targetMember.organization;

    // if (!viewerOrg || !targetOrg) {
    //   throw new ForbiddenException('Organization access is required');
    // }

    // if (viewerOrg.id !== targetOrg.id) {
    //   throw new ForbiddenException('Cross-organization access denied');
    // }

    // if (!viewerOrg.groupChatEnabled) {
    //   throw new ForbiddenException('Organization feature is disabled');
    // }

    return {
      id: targetMember.id,
      name: targetMember.name,
      profileImg: targetMember.profileImg,
      pets: (targetMember.pets || []).map((p) => ({
        dob: p.dob,
        breed: p.breed,
        name: p.name,
        isDeceased: p.isDeceased,
        careId: p.careId,
        photos: p.photos || [],
      })),
    };
  }

  async findOneByPhone(phone: string): Promise<Member> {
    const cleanPhone = phone.replace(/^\+\d{1,3}/, '');

    const member = await this.memberRepo.findOne({
      where: { phone: ILike(`%${cleanPhone}%`) },
    });

    if (!member) {
      throw new NotFoundException(`Member with phone "${phone}" not found`);
    }

    return member;
  }

  async findOneByEmail(email: string): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: { email },
    });

    if (!member) {
      throw new NotFoundException(`Member with email "${email}" not found`);
    }

    return member;
  }

  async create(registerMemberDto: RegisterMemberDto): Promise<Member> {
    const { phone, email } = registerMemberDto;

    const queryRunner = this.memberRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const _member = this.memberRepo.create();

      _member.phone = phone;
      _member.email = email;

      try {
        if (phone) {
          _member.stripeCustomerId =
            await this.stripeService.createStripeCustomer(phone, undefined);
        } else {
          _member.stripeCustomerId =
            await this.stripeService.createStripeCustomer(undefined, email);
        }
      } catch {
        // Stripe not configured or failed (e.g. dev without STRIPE_SECRET_KEY)
        _member.stripeCustomerId = null;
      }

      // Save the member
      const member = await queryRunner.manager.save(_member);

      await queryRunner.commitTransaction();
      return member;
    } catch (err) {
      console.log('err', err);
      await queryRunner.rollbackTransaction();

      if (err.code === '23505') {
        throw err;
      }

      throw new InternalServerErrorException('Failed to create user');
    } finally {
      await queryRunner.release();
    }
  }

  async updateStripeId(
    id: string,
    userPhone?: string,
    userEmail?: string,
  ): Promise<void> {
    this.logger.info(
      `[LOG: MEMBER_SERVICE] Updating stripe id for member ${id}`,
    );

    const stripeCustomerId = await this.stripeService.createStripeCustomer(
      userPhone,
      userEmail,
    );

    await this.memberRepo.update({ id }, { stripeCustomerId });

    this.logger.info(
      `[LOG: MEMBER_SERVICE] Stripe id updated for member ${id}`,
    );
  }

  async update(id: string, body: UpdateMemberPayloadDto): Promise<Member> {
    const queryRunner = this.memberRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { ...payload } = body;

      const _member = await this.findOne(id);

      if (!_member) {
        throw new NotFoundException(`Member with id "${id}" not found`);
      }

      let isEmailVerified = _member.isEmailVerified;

      // If email is being changed, we need to set isEmailVerified to false
      if (body.email) {
        isEmailVerified = false;
      }

      if (body.phone) {
        _member.isPhoneVerified = false;
      }

      const updatedMember = this.memberRepo.create({
        ..._member,
        isEmailVerified,
        ...payload,
      });

      const member = await queryRunner.manager.save(updatedMember);

      if ((body.name || body.email) && member.stripeCustomerId) {
        await this.stripeService.updateStripeCustomer(member.stripeCustomerId, {
          name: body.name,
          email: body.email,
        });
      }

      await this.redisService.setJson(
        `member:summary:${member.id}`,
        { id: member.id, name: member.name, profileImg: member.profileImg },
        3600,
      );

      await queryRunner.commitTransaction();
      return member;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `[LOG: MEMBER_SERVICE] Failed to update member ${id}: ${err?.message}`,
        err?.stack,
      );

      if (err?.code === '23505') {
        const detail = err?.detail || '';
        if (detail.includes('email')) {
          throw new BadRequestException('This email is already in use.');
        }
        if (detail.includes('phone')) {
          throw new BadRequestException('This phone number is already in use.');
        }
      }

      throw new InternalServerErrorException('Failed to update user');
    } finally {
      await queryRunner.release();
    }
  }

  async sendEmailVerification(user: AuthUser): Promise<void> {
    const member = await this.findOne(user.id);

    if (member.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!member.email) {
      throw new BadRequestException('Email not added');
    }

    await this.verifyService.sendEmailVerificationCode(member.email);
  }

  async sendPhoneVerification(user: AuthUser): Promise<void> {
    const member = await this.findOne(user.id);

    if (member.isPhoneVerified) {
      throw new BadRequestException('Phone already verified');
    }

    if (!member.phone) {
      throw new BadRequestException('Phone not added');
    }

    await this.verifyService.sendPhoneVerificationCode(member.phone);
  }

  async verifyEmail(user: AuthUser, body: VerifyEmailDto): Promise<void> {
    try {
      const { otp } = body;

      if (!user.email) {
        throw new BadRequestException('Email not found.');
      }

      const result = await this.verifyService.verifyEmailVerificationCode(
        user.email,
        otp,
      );

      if ((result as { status?: string }).status !== 'approved') {
        throw new BadRequestException('Invalid OTP');
      }

      await this.update(user.id, { isEmailVerified: true });
    } catch (err) {
      if (err?.code === 20404) {
        throw new BadRequestException('Invalid OTP or OTP expired');
      }

      throw err;
    }
  }

  async verifyPhone(user: AuthUser, body: VerifyPhoneDto): Promise<void> {
    try {
      const { otp } = body;

      if (!user.phone) {
        throw new BadRequestException('Phone not found.');
      }

      const { valid } = await this.verifyService.verifyPhoneVerificationCode(
        user.phone,
        otp,
      );

      if (!valid) {
        throw new BadRequestException('Invalid OTP');
      }

      await this.update(user.id, { isPhoneVerified: true });
    } catch (err) {
      if (err?.code === 20404) {
        throw new BadRequestException('Invalid OTP or OTP expired');
      }

      throw err;
    }
  }

  private transformBookingToAppointment(booking: PartnerBooking) {
    return {
      id: booking.id,
      scheduledAt: booking.scheduledAt,
      allServices: booking.partnerCost?.services ?? null,
      services: booking?.services ?? null,
      caseId: booking?.case?.id ?? null,
      isEmergency: booking?.case?.isEmergency ?? null,
      partner: {
        id: booking.partner.id,
        name: booking.partner.name,
        clinicImg: booking.partner.clinicImg,
        email: booking.partner.email ?? '',
        phone: booking.partner.phone ?? '',
        address: booking.partner.address,
      },
      vet: booking.vet
        ? {
          id: booking.vet.id,
          name: booking.vet.name,
          profileImg: booking.vet.profileImg,
          city: booking.partner.city,
          country: booking.partner.country,
          designation: booking.vet.designation,
        }
        : null,
      pet: {
        name: booking.case.pet?.name ?? null,
        photos: booking.case.pet?.photos ?? null,
      },
      type: 'in-clinic',
      status: booking.status,
      paymentIntentId: booking.paymentIntentId,
      createdAt: booking.createdAt,
    };
  }

  private transformConsultationToAppointment(consultation: VetConsultation) {
    return {
      id: consultation.id,
      scheduledAt: consultation.scheduledAt,
      partner: null,
      services: null,
      allServices: null,
      isEmergency: consultation.case?.isEmergency ?? null,
      caseId: consultation.case.id,
      vet: {
        id: consultation.vet.id,
        name: consultation.vet.name,
        profileImg: consultation.vet.profileImg,
        designation: consultation.vet.designation,
      },
      pet: {
        name: consultation.case.pet?.name ?? null,
        photos: consultation.case.pet?.photos ?? null,
      },
      type: 'video',
      status: consultation.status,
      paymentIntentId: null,
      createdAt: consultation.createdAt,
    };
  }

  async findAllAppointments(member: AuthUser, query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    this.logger.info(
      `[LOG: MEMBER_SERVICE] Finding all bookings for member ${member.id}`,
    );

    const bookingQuery = this.partnerBookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.partner', 'partner')
      .leftJoinAndSelect('booking.vet', 'vet')
      .leftJoinAndSelect('booking.case', 'case')
      .leftJoinAndSelect('case.pet', 'pet')
      .where('booking.member.id = :memberId', { memberId: member.id })
      .andWhere('booking.status IN (:...bookingStatuses)', {
        bookingStatuses: [
          BookingStatusEnum.INITIATED,
          BookingStatusEnum.RESCHEDULED,
        ],
      });

    this.logger.info(
      `[LOG: MEMBER_SERVICE] Finding all consultations for member ${member.id}`,
    );

    const consultationQuery = this.vetConsultationRepo
      .createQueryBuilder('consultation')
      .leftJoinAndSelect('consultation.vet', 'vet')
      .leftJoinAndSelect('consultation.case', 'case')
      .leftJoinAndSelect('case.pet', 'pet')
      .where('consultation.member.id = :memberId', { memberId: member.id })
      .andWhere('consultation.status = :consultationStatus', {
        consultationStatus: ConsultationStatusEnum.SCHEDULED,
      });

    const [bookings, bookingsCount] = await bookingQuery
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const [consultations, consultationsCount] = await consultationQuery
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const combinedResults = [
      ...bookings.map(this.transformBookingToAppointment),
      ...consultations.map(this.transformConsultationToAppointment),
    ];

    // Sort combined results by scheduledAt in descending order
    combinedResults.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const totalCount = bookingsCount + consultationsCount;

    this.logger.info(
      `[LOG: MEMBER_SERVICE] Found ${totalCount} appointments for member ${member.id}`,
    );

    return {
      data: combinedResults,
      count: totalCount,
      currentPage: page,
      nextPage: totalCount / limit > page ? page + 1 : null,
    };
  }

  async findOneAppointment(
    member: AuthUser,
    id: string,
    type: 'in-clinic' | 'video',
  ) {
    if (type === 'in-clinic') {
      const booking = await this.partnerService.findOneAppointment(member, id, {
        member: true,
        partner: true,
        vet: true,
        case: {
          pet: true,
        },
        partnerCost: true,
      });

      return this.transformBookingToAppointment(booking);
    } else if (type === 'video') {
      const consultation = await this.vetService.findOneConsultation(
        member,
        id,
        {
          vet: true,
          member: true,
          case: {
            pet: true,
          },
        },
      );

      return this.transformConsultationToAppointment(consultation);
    }
  }

  async deactivate(user: AuthUser) {
    const member = this.memberRepo.create({ id: user.id });

    this.memberRepo.merge(member, { status: MemberStatusEnum.INACTIVE });
    await this.memberRepo.save(member);

    try {
      await this.notificationService.sendSmsNotification(
        user.phone,
        'Your Smoll account has been deactivated as requested. Your data will be kept for 7 days before permanent deletion. To reactivate, contact care@smoll.me.',
      );
    } catch (err) {
      this.logger.error(
        `[LOG: MEMBER_SERVICE] Failed to send sms notification to ${member.phone}`,
      );
    }

    try {
      if (user.email) {
        await this.notificationService.sendEmailNotification(
          user.email,
          'Account Deactivation',
          accountDeactivationTemplate(user.name),
        );
      }
    } catch (err) {
      this.logger.error(
        `[LOG: MEMBER_SERVICE] Failed to send email notification to ${user.email}`,
      );
    }
  }

  async findOrganizationByMemberId(
    memberId: string,
  ): Promise<Organization | null> {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['organization'], // fetch linked organization
    });

    if (!member || !member.organization) {
      return null; // either member not found or no organization linked
    }

    return member.organization;
  }

  async findBasicDetailsByIds(ids: string[]): Promise<Member[]> {
    if (!ids || ids.length === 0) {
      this.logger.error(
        `[LOG: MEMBER_SERVICE] Invalid IDs provided for findBasicDetailsByIds`,
      );
      return [];
    }

    // Use In() operator to find members by IDs
    const { In } = await import('typeorm');
    return await this.memberRepo.find({
      where: { id: In(ids) },
      select: ['id', 'name', 'profileImg'], // Select only necessary fields
    });
  }

  async findBasicDetailsByIdsCached(ids: string[]): Promise<Member[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const results: Record<string, Member> = {};

    // Caching logic commented out
    // for (const id of uniqueIds) {
    //   const cached = await this.redisService.getJson<{
    //     id: string;
    //     name: string | null;
    //     profileImg: FindFileResDto | null;
    //   }>(`member:summary:${id}`);
    //   if (cached) {
    //     results[id] = this.memberRepo.create(cached as Partial<Member>);
    //   } else {
    //     missing.push(id);
    //   }
    // }

    // Fetch all IDs directly from database (caching disabled)
    // if (missing.length) {
    const { In } = await import('typeorm');
    const fetched = await this.memberRepo.find({
      where: { id: In(uniqueIds) },
      select: ['id', 'name', 'profileImg'],
    });

    for (const m of fetched) {
      // Cache write commented out
      // await this.redisService.setJson(
      //   `member:summary:${m.id}`,
      //   { id: m.id, name: m.name, profileImg: m.profileImg },
      //   3600,
      // );
      results[m.id] = m;
    }
    // }

    const ordered = uniqueIds.map((id) => results[id]).filter(Boolean);
    return ordered;
  }
}
