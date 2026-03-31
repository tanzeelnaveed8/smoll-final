import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SpecialityService } from '../services/speciality.service';
import { FindAllSpecialitiesResDto } from '../dtos/find.speciality.dto';

@ApiTags('Specialities')
@Controller('/specialities')
export class SpecialityController {
    constructor(private readonly specialityService: SpecialityService) { }

    @Get()
    async findAll(): Promise<FindAllSpecialitiesResDto[]> {
        const specialities = await this.specialityService.findAll();

        return plainToInstance(FindAllSpecialitiesResDto, specialities, {
            excludeExtraneousValues: true,
        });
    }
}
