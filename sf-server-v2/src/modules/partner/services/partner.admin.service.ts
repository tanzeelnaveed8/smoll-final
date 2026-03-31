import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PwdService } from '../../../modules/auth/services/pwd.service';
import { VerifyService } from 'src/modules/verify/verify.service';
import { FindManyOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Partner } from '../entities/partner.entity';
import { PartnerSpeciality } from '../entities/partner.speciality.entity';
import { UpdatePartnerPayloadDto } from '../dto/update.dto';
import { CreatePartnerPayloadDto } from '../dto/create.admin.dto';
import { paginate, PaginationResult } from 'src/utils/pagination';
import { FindAllPartnerAdminQueryDto } from '../dto/find.admin.dto';

@Injectable()
export class PartnerAdminService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    private readonly verifyService: VerifyService,
    private readonly pwdService: PwdService,
  ) {}

  async findAll(
    query: FindAllPartnerAdminQueryDto,
  ): Promise<PaginationResult<Partner>> {
    const { search, isPending, isSuspended, ...pageQuery } = query;

    const searchQuery = search ? ILike(`%${search}%`) : undefined;

    const whereConditions: FindOptionsWhere<Partner>[] = [
      { email: searchQuery },
      { name: searchQuery },
      { receptionistName: searchQuery },
    ];

    if (isPending) {
      whereConditions.forEach((condition) => (condition.isPending = isPending));
    }

    whereConditions.forEach(
      (condition) => (condition.isSuspended = isSuspended ?? false),
    );

    const findOptions: FindManyOptions<Partner> = {
      where: whereConditions,
      relations: {
        specialities: true,
      },
      order: {
        createdAt: 'DESC',
      },
    };

    return paginate(this.partnerRepo, pageQuery, findOptions);
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnerRepo.findOne({
      where: { id },
      relations: {
        specialities: true,
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ${id} not found`);
    }

    return partner;
  }

  async resetPassword(id: string): Promise<void> {
    try {
      const partner = await this.findOne(id);

      const pwd = this.pwdService.getTempPwd();

      partner.password = await this.pwdService.hashPwd(pwd);

      await this.partnerRepo.save(partner);

      this.verifyService.sendTemporaryPassword(partner.email, pwd);
    } catch (err) {
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async create(body: CreatePartnerPayloadDto): Promise<Partner> {
    try {
      const { specialities, ...rest } = body;

      const _partner = this.partnerRepo.create(rest);

      if (specialities) {
        _partner.specialities = specialities.map((speciality) => ({
          speciality: { id: speciality },
        })) as unknown as PartnerSpeciality[];
      }

      const pwd = this.pwdService.getTempPwd();

      _partner.password = await this.pwdService.hashPwd(pwd);

      const partner = await this.partnerRepo.save(_partner);
      this.verifyService.sendTemporaryPassword(partner.email, pwd);

      return partner;
    } catch (err) {
      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: string, body: UpdatePartnerPayloadDto): Promise<Partner> {
    const { specialities, ...rest } = body;

    const partner = await this.findOne(id);

    if (specialities) {
      partner.specialities = specialities.map((speciality) => ({
        speciality: { id: speciality },
      })) as unknown as PartnerSpeciality[];
    }

    const _partner = Object.assign(partner, rest);

    return this.partnerRepo.save(_partner);
  }

  async suspend(id: string): Promise<void> {
    const partner = await this.findOne(id);

    if (partner.isSuspended) {
      throw new BadRequestException('Partner is already suspended.');
    }

    await this.partnerRepo.update({ id }, { isSuspended: true });

    this.verifyService.sendMail({
      to: partner.email,
      subject: 'Account suspended',
      text: 'Your account has been suspended',
      from: 'no-reply@smoll.me',
    });
  }

  async activate(id: string): Promise<void> {
    const partner = await this.findOne(id);

    if (!partner.isSuspended) {
      throw new BadRequestException('Partner is already active.');
    }

    await this.partnerRepo.update({ id }, { isSuspended: false });
  }
}
