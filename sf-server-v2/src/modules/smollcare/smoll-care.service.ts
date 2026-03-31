import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptions, FindOptionsWhere, Repository } from 'typeorm';
import { SmollCarePlan } from './entities/smoll-care-plan.entity';
import { SmollCareBenefit } from './entities/smoll-care-benefit.entity';

import { CreateBenefit } from './dto/create-benefit.dto';
import { SmollCareBenefitResDto, SmollCarePlanResDto } from './dto/find-dto';
import { plainToInstance } from 'class-transformer';
import { CreateSmollCarePlanDto } from './dto/create-plan.dto';
import {
  BenefitUsageFilterDto,
  SmollCareBenefitUsageSummaryResDto,
} from '../member/dtos/find.admin.dto';
import { SmollCareBenefitUsage } from './entities/smoll-care-benefit-usage.entity';
import dayJS from 'src/utils/dayjs';
import { create } from 'domain';
import { paginate, PaginationResult } from 'src/utils/pagination';
import path from 'path';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import { AuthUser } from 'src/decorators/get-user.decorator';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class SmollCareService {
  constructor(
    @InjectRepository(SmollCarePlan)
    private smollCarePlanRepository: Repository<SmollCarePlan>,
    @InjectRepository(SmollCareBenefit)
    private readonly smollCareBenefitRepository: Repository<SmollCareBenefit>,
    @InjectRepository(SmollCareBenefitUsage)
    private readonly smollCareBenefitUsageRepo: Repository<SmollCareBenefitUsage>,
  ) { }

  async findPlan(planId: number): Promise<SmollCarePlanResDto> {
    const plan = await this.smollCarePlanRepository.findOne({
      where: {
        id: planId,
      },
    });
    if (!plan) throw new NotFoundException('Plan with Id not found.');
    return plainToInstance(SmollCarePlanResDto, plan, {
      excludeExtraneousValues: true,
    });
  }

  async addBenefit(benefitDetails: CreateBenefit): Promise<SmollCareBenefit> {
    const { planId, name, description, maxUsagePerSubscription } =
      benefitDetails;
    await this.findPlan(planId);

    const benefit = this.smollCareBenefitRepository.create({
      plan: {
        id: planId,
      },
      name,
      description,
      maxUsagePerSubscription,
    });
    return this.smollCareBenefitRepository.save(benefit);
  }

  async createPlan(planDetails: CreateSmollCarePlanDto) {
    const plan = this.smollCarePlanRepository.create(planDetails);
    return await this.smollCarePlanRepository.save(plan);
  }

  async getBenefitUsageSummary(
    query: BenefitUsageFilterDto,
    user: AuthUser,
  ): Promise<PaginationResult<SmollCareBenefitUsageSummaryResDto>> {
    const { month, year, page, limit } = query;
    // const where: FindOptionsWhere<SmollCareBenefitUsage>[] = [];
    const where: any = { deletedAt: null };
    const partnerId = user.id;

    // Filter on related Partner entity
    if (partnerId) {
      where.partner = {
        id: partnerId,
      };
    }

    if (month && year) {
      const start = dayJS(`${year}-${month}-01`).startOf('month').toDate();
      const end = dayJS(start).endOf('month').toDate();
      // where.push({ createdAt: Between(start, end) });
      where.createdAt = Between(start, end);
    }

    const result = await paginate(
      this.smollCareBenefitUsageRepo,
      { page, limit },
      {
        where,
        relations: {
          benefit: true,
          subscription: {
            pet: {
              owner: true,
            },
          },
          partner: true,
        },
        order: {
          createdAt: 'ASC',
        },
      },
    );

    return {
      ...result,
      data: result.data.map((usage) => ({
        serviceName: usage.benefit?.name,
        date: usage.createdAt,
        petOwner: usage.subscription?.pet?.owner?.name || 'Unknown',
        membershipId: usage.subscription?.pet?.careId || 'Unknown',
        vetName: usage.vet || 'Unknown',
        note: usage.note || null,
      })),
    };
  }

  async exportBenefitUsageSummaryPDF(
    query: BenefitUsageFilterDto,
    user: AuthUser,
  ): Promise<Buffer> {
    const result = await this.getBenefitUsageSummary(query, user);

    try {
      // const filePath = path.join(
      //   __dirname,
      //   '.',
      //   'templates/benefit-usage-summary.ejs',
      // );
      const filePath = path.join(
        process.cwd(),
        process.env.NODE_ENV === 'production' ? 'dist' : 'src',
        'modules',
        'smollcare',
        'templates',
        'benefit-usage-summary.ejs',
      );
      const html = await ejs.renderFile(filePath, {
        data: result.data,
        month: query.month,
        year: query.year,
      });

     const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      // await browser.close();
      return Buffer.from(pdfBuffer); // ✅ Fixes the Uint8Array issue
    } catch (error) {
      console.error('PDF export error:', error);
      throw new InternalServerErrorException('Failed to generate PDF');
    }
  }
}
