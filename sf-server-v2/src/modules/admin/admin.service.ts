import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { Case } from '../case/case.entity';
import { Partner } from '../partner/entities/partner.entity';
import { Vet } from '../vet/entities/vet.entity';
import { Member } from '../member/member.entity';
import { CaseStatusEnum } from '../case/enums/case-status.enum';
import { Service } from '../service/service.entity';
import { Product } from '../product/product.entity';
import { PaymentLog, PaymentStatus } from '../payment-log/payment-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepo: Repository<PaymentLog>,
  ) {}

  findOneByEmail(email: string): Promise<Admin> {
    return this.adminRepo.findOne({ where: { email } });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.adminRepo.update({ id }, { password });
  }

  async findAnalytics() {
    const caseQb = () => this.caseRepo.createQueryBuilder('case')
      .leftJoin('case.vetConsultation', 'vetConsultation')
      .where('vetConsultation.id IS NULL');

    const cases = await caseQb().getCount();
    const partners = await this.partnerRepo.count();
    const vets = await this.vetRepo.count();
    const members = await this.memberRepo.count();
    const services = await this.serviceRepo.count();
    const products = await this.productRepo.count();
    const pendingCases = await caseQb().andWhere('case.status = :status', { status: CaseStatusEnum.PENDING }).getCount();
    const confirmedCases = await caseQb().andWhere('case.status = :status', { status: CaseStatusEnum.CONFIRMED }).getCount();
    const rejectedCases = await caseQb().andWhere('case.status = :status', { status: CaseStatusEnum.REJECTED }).getCount();
    const escalatedCases = await caseQb().andWhere('case.status = :status', { status: CaseStatusEnum.OPEN_ESCALATED }).getCount();
    const revenueResult = await this.paymentLogRepo
      .createQueryBuilder('pl')
      .select('COALESCE(SUM(pl.amount), 0)', 'total')
      .where('pl.status = :status', { status: PaymentStatus.success })
      .getRawOne<{ total: string }>();
    const totalRevenue = Number(revenueResult?.total ?? 0);

    return {
      cases,
      partners,
      vets,
      members,
      services,
      products,
      pendingCases,
      confirmedCases,
      rejectedCases,
      escalatedCases,
      totalRevenue,
    };
  }
}
