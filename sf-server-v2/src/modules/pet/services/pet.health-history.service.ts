import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PetHealthHistory } from '../entities/pet.health-history.entity';
import { Repository } from 'typeorm';
import { CreatePetHealthHistoryPayloadDto } from '../dto/create.dto';
import { PetService } from './pet.service';
import { UpdatePetHealthHistoryPayloadDto } from '../dto/update.dto';

@Injectable()
export class PetHealthHistoryService {
  constructor(
    @InjectRepository(PetHealthHistory)
    private readonly petHealthHistoryRepo: Repository<PetHealthHistory>,
    private readonly petService: PetService,
  ) {}

  async findOne(
    userId: string,
    petId: string,
    id: string,
  ): Promise<PetHealthHistory> {
    const healthHistory = await this.petHealthHistoryRepo.findOne({
      where: { id, pet: { id: petId, owner: { id: userId } } },
    });

    if (!healthHistory) {
      throw new NotFoundException('Pet health history not found');
    }

    return healthHistory;
  }

  async create(
    userId: string,
    id: string,
    body: CreatePetHealthHistoryPayloadDto,
  ): Promise<PetHealthHistory> {
    await this.petService.findOne(userId, id);

    const _healthHistory = this.petHealthHistoryRepo.create(body);
    _healthHistory.pet = <any>{ id };

    const healthHistory = await this.petHealthHistoryRepo.save(_healthHistory);

    return healthHistory;
  }

  async update(
    userId: string,
    petId: string,
    id: string,
    body: UpdatePetHealthHistoryPayloadDto,
  ): Promise<PetHealthHistory> {
    const _healthHistory = await this.findOne(userId, petId, id);

    const healthHistory = await this.petHealthHistoryRepo.save({
      ..._healthHistory,
      ...body,
    });

    return healthHistory;
  }

  async delete(userId: string, petId: string, id: string): Promise<void> {
    await this.findOne(userId, petId, id);
    await this.petHealthHistoryRepo.delete(id);
  }
}
