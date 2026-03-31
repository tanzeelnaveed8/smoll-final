import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Speciality } from '../entities/speciality.entity';

@Injectable()
export class SpecialityService {
    constructor(
        @InjectRepository(Speciality)
        private readonly specialityRepo: Repository<Speciality>,
    ) { }

    async findAll(): Promise<Speciality[]> {
        return this.specialityRepo.find({
            order: {
                name: 'ASC',
            },
        });
    }
}
