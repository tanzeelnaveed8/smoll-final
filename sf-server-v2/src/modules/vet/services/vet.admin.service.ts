import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PwdService } from '../../../modules/auth/services/pwd.service';
import { VerifyService } from 'src/modules/verify/verify.service';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { Vet } from '../entities/vet.entity';
import { FindAllVetQueryDto } from '../dtos/find.admin.dto';
import { paginate, PaginationResult } from 'src/utils/pagination';
import { CreateVetPayloadDto } from '../dtos/create.admin.dto';
import { UpdateVetPayloadDto } from '../dtos/update.admin.dto';
import { VetSpeciality } from '../entities/vet.speciality.entity';
import { Case } from '../../case/case.entity';

@Injectable()
export class VetAdminService {
  constructor(
    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    private readonly pwdService: PwdService,
    private readonly verifyService: VerifyService,
  ) {}

  async findOne(id: string): Promise<Vet> {
    const vet = await this.vetRepo.findOne({
      where: { id },
      relations: ['vetSpecialities', 'vetSpecialities.speciality'],
    });

    if (!vet) {
      throw new NotFoundException(`Vet with "${id}" not found`);
    }

    return vet;
  }

  async findAll(
    query?: FindAllVetQueryDto,
  ): Promise<PaginationResult<Vet & { avgRating: number }>> {
    const { isSuspended, search, ...pageQuery } = query;

    const searchQuery = search ? ILike(`%${search}%`) : undefined;

    const findOptions: FindManyOptions<Vet> = {
      where: [
        { email: searchQuery, isSuspended: isSuspended ?? false, isHomeVet: false },
        { name: searchQuery, isSuspended: isSuspended ?? false, isHomeVet: false },
      ],
      relations: {
        feedbacks: true,
      },
      order: {
        createdAt: 'DESC',
      },
    };

    const vets = await paginate(this.vetRepo, pageQuery, findOptions);

    const data = vets.data.map((v) => {
      const totalRating = v.feedbacks.reduce(
        (acc, curr) => acc + curr.rating,
        0,
      );

      return {
        ...v,
        avgRating: (totalRating / v.feedbacks.length).toFixed(1),
      };
    });

    return {
      ...vets,
      // @ts-expect-error invalid
      data,
    };
  }

  async create(body: CreateVetPayloadDto): Promise<Vet> {
    const queryRunner = this.vetRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { specialityIds, password, ...vetData } = body;
      const _vet = this.vetRepo.create({
        ...vetData,
        // Normalize email to lowercase so it matches login behavior
        email: vetData.email?.toLowerCase(),
      });
      if (body.isHomeVet !== undefined) {
        _vet.isHomeVet = body.isHomeVet;
      }
      const pwd = password && password.length >= 6 ? password : this.pwdService.getTempPwd();

      _vet.password = await this.pwdService.hashPwd(pwd);

      const vet = await queryRunner.manager.save(_vet);

      // Save vet specialities if provided
      if (specialityIds?.length) {
        const vetSpecialities = specialityIds.map((specialityId) =>
          queryRunner.manager.create(VetSpeciality, {
            vetId: vet.id,
            specialityId,
          }),
        );
        await queryRunner.manager.save(VetSpeciality, vetSpecialities);
      }

      await queryRunner.commitTransaction();
      try { this.verifyService.sendTemporaryPassword(vet.email, pwd); } catch (_) {}

      // Return vet with specialities loaded
      return this.vetRepo.findOne({
        where: { id: vet.id },
        relations: ['vetSpecialities', 'vetSpecialities.speciality'],
      });
    } catch (err) {
      console.log(err?.response?.data ?? err?.message ?? err);
      await queryRunner.rollbackTransaction();

      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }

      throw new InternalServerErrorException('Failed to create user');
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, body: UpdateVetPayloadDto): Promise<Vet> {
    const vet = await this.findOne(id);

    // Update vet fields (excluding specialityIds)
    Object.assign(vet, {
      ...body,
      specialityIds: undefined, // prevent trying to save directly
    });
    await this.vetRepo.save(vet);

    // Handle specialities separately
    if (body.specialityIds) {
      // Clear old specialities
      await this.vetRepo.manager.delete(VetSpeciality, { vetId: id });

      // Insert new specialities
      const newSpecialities = body.specialityIds.map((specialityId) =>
        this.vetRepo.manager.create(VetSpeciality, { vetId: id, specialityId }),
      );

      await this.vetRepo.manager.save(VetSpeciality, newSpecialities);
    }

    // Return updated vet with relations
    return this.vetRepo.findOne({
      where: { id },
      relations: ['vetSpecialities', 'vetSpecialities.speciality'],
    });
  }

  async suspend(id: string): Promise<void> {
    const vet = await this.findOne(id);

    if (vet.isSuspended) {
      throw new BadRequestException('Vet is already suspended.');
    }

    await this.vetRepo.update({ id }, { isSuspended: true });

    this.verifyService.sendMail({
      to: vet.email,
      subject: 'Account suspended',
      text: 'Your account has been suspended',
      from: 'no-reply@smoll.me',
    });
  }

  async activate(id: string): Promise<void> {
    const vet = await this.findOne(id);

    if (!vet.isSuspended) {
      throw new BadRequestException('Vet is already active.');
    }

    await this.vetRepo.update({ id }, { isSuspended: false });
  }

  async findVetCases(vetId: string) {
    const cases = await this.caseRepo.find({
      where: { assignedVet: { id: vetId } },
      relations: { member: true, pet: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return cases;
  }

  async resetPassword(id: string) {
    const vet = await this.findOne(id);
    const pwd = this.pwdService.getTempPwd();
    vet.password = await this.pwdService.hashPwd(pwd);
    await this.vetRepo.save(vet);
    try { this.verifyService.sendTemporaryPassword(vet.email, pwd); } catch (_) {}
    console.log(`[DEV] Password for ${vet.email}: ${pwd}`);
    return { message: 'Password reset email sent' };
  }
}
