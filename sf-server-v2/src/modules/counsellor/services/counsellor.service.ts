import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Counsellor } from '../entities/counsellor.entity';
import { PwdService } from '../../auth/services/pwd.service';
import { VerifyService } from '../../verify/verify.service';
import { CreateCounsellorPayloadDto } from '../dtos/create.dto';
import { UpdateCounsellorPayloadDto } from '../dtos/update.dto';
import { FindAllCounsellorsQueryDto } from '../dtos/find.dto';

@Injectable()
export class CounsellorService {
  constructor(
    @InjectRepository(Counsellor)
    private readonly counsellorRepo: Repository<Counsellor>,
    private readonly pwdService: PwdService,
    private readonly verifyService: VerifyService,
  ) {}

  async findOneByEmail(email: string): Promise<Counsellor> {
    const counsellor = await this.counsellorRepo.findOne({ where: { email } });
    return counsellor;
  }

  async findAll(): Promise<Counsellor[]> {
    const counsellors = await this.counsellorRepo.find();
    return counsellors;
  }

  async findAllPaginated(query: FindAllCounsellorsQueryDto): Promise<{ data: Counsellor[]; count: number }> {
    const { page = 1, limit = 10, isSuspended, search } = query;
    const where: any = {};
    if (isSuspended !== undefined) where.isSuspended = isSuspended;
    if (search) where.name = ILike(`%${search}%`);

    const [data, count] = await this.counsellorRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { createdAt: 'DESC' },
    });
    return { data, count };
  }

  async findOne(id: string): Promise<Counsellor> {
    const counsellor = await this.counsellorRepo.findOne({ where: { id } });
    if (!counsellor) throw new NotFoundException(`Counsellor with id ${id} not found`);
    return counsellor;
  }

  async update(id: string, body: UpdateCounsellorPayloadDto): Promise<Counsellor> {
    const counsellor = await this.findOne(id);
    Object.assign(counsellor, body);
    return this.counsellorRepo.save(counsellor);
  }

  async suspend(id: string): Promise<void> {
    const counsellor = await this.findOne(id);
    counsellor.isSuspended = true;
    await this.counsellorRepo.save(counsellor);
  }

  async activate(id: string): Promise<void> {
    const counsellor = await this.findOne(id);
    counsellor.isSuspended = false;
    await this.counsellorRepo.save(counsellor);
  }

  async resetPassword(id: string): Promise<void> {
    const counsellor = await this.findOne(id);
    const pwd = this.pwdService.getTempPwd();
    counsellor.password = await this.pwdService.hashPwd(pwd);
    await this.counsellorRepo.save(counsellor);
    this.verifyService.sendTemporaryPassword(counsellor.email, pwd);
  }

  async create(body: CreateCounsellorPayloadDto): Promise<Counsellor> {
    const queryRunner =
      this.counsellorRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const _counsellor = this.counsellorRepo.create(body);

      const pwd = this.pwdService.getTempPwd();

      _counsellor.password = await this.pwdService.hashPwd(pwd);

      const counsellor = await queryRunner.manager.save(_counsellor);

      await queryRunner.commitTransaction();
      this.verifyService.sendTemporaryPassword(counsellor.email, pwd);

      return counsellor;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err.code === '23505') {
        throw new BadRequestException('Email or phone already exists');
      }

      throw new InternalServerErrorException('Failed to create user');
    } finally {
      await queryRunner.release();
    }
  }
}
