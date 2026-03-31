import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginationResult } from 'src/utils/pagination';
import { FindManyOptions, ILike, In, Repository } from 'typeorm';
import {
  FindAllPartnersForVetQueryDto,
  FindAllServicesForVetQueryDto,
} from '../dto/find.vet.dto';
import { Partner } from '../entities/partner.entity';
import { PartnerServices } from '../entities/partner.services.entity';
import { Logger } from 'src/configs/logger';

@Injectable()
export class PartnerVetService {
  private readonly logger = Logger.getInstance();

  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  async findAll(
    query: FindAllPartnersForVetQueryDto,
  ): Promise<PaginationResult<Partner>> {
    const { search, specialities, country, city, quickList, ...pageQuery } =
      query;

    const findOptions: FindManyOptions<Partner> = {
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
        country: country ? ILike(`%${country}%`) : undefined,
        city: city ? ILike(`%${city}%`) : undefined,
        specialities: specialities
          ? {
              name: In(specialities),
            }
          : undefined,
        services: {
          quickBooking: quickList ? true : undefined,
        },
        isSuspended: false,
      },
      relations: {
        vets: true,
      },
    };

    return paginate(this.partnerRepo, pageQuery, findOptions);
  }

  async findAllServices(
    id: string,
    query: FindAllServicesForVetQueryDto,
  ): Promise<PartnerServices[]> {
    const { quickList } = query;

    this.logger.info(
      `[LOG: PARTNER_VET_SERVICE] findAllServices called with id: ${id} and quickList: ${quickList}`,
    );

    const partner = await this.partnerRepo.findOne({
      where: {
        id,
        services: {
          quickBooking: quickList ? true : undefined,
        },
      },
      relations: {
        services: true,
      },
    });

    if (!partner) {
      this.logger.error(
        `[LOG: PARTNER_VET_SERVICE] Partner not found with id: ${id}`,
      );

      throw new NotFoundException('Partner not found');
    }

    return partner.services;
  }
}
