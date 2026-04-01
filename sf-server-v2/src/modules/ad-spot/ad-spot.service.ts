import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdSpot } from './ad-spot.entity';
import { CreateAdSpotDto, UpdateAdSpotDto } from './dto/ad-spot.dto';

@Injectable()
export class AdSpotService {
  constructor(
    @InjectRepository(AdSpot)
    private readonly adSpotRepo: Repository<AdSpot>,
  ) {}

  async create(dto: CreateAdSpotDto): Promise<AdSpot> {
    const adSpot = this.adSpotRepo.create(dto);
    return this.adSpotRepo.save(adSpot);
  }

  async findAll(position?: string): Promise<AdSpot[]> {
    const query = this.adSpotRepo.createQueryBuilder('ad_spot')
      .where('ad_spot.isActive = :isActive', { isActive: true });

    if (position) {
      query.andWhere('ad_spot.position = :position', { position });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<AdSpot | null> {
    return this.adSpotRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateAdSpotDto): Promise<AdSpot> {
    await this.adSpotRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.adSpotRepo.delete(id);
  }
}
