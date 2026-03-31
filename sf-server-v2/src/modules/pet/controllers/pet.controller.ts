import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreatePetPayloadDto, CreatePetResDto } from '../dto/create.dto';
import {
  FindAllPetsQueryDto,
  FindAllPetsResDto,
  FindOnePetResDto,
  FindOnePetWithBenefitsResDto,
} from '../dto/find.dto';
import { UpdatePetPayloadDto, UpdatePetResDto } from '../dto/update.dto';
import { PetService } from '../services/pet.service';
import { join } from 'path';
import { readFileSync } from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { GetUser } from 'src/decorators/get-user.decorator';

@ApiTags('Pet: Member Role')
@Controller('/member/pets')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class PetController {
  constructor(private readonly petService: PetService) { }

  @Get('/breeds')
  async findAllBreeds(): Promise<any> {
    const breedsPath = join(process.cwd(), 'src/modules/pet/breeds.json');
    const breedsData = readFileSync(breedsPath, 'utf-8');
    return JSON.parse(breedsData);
  }

  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @Query() query: FindAllPetsQueryDto,
  ): Promise<FindAllPetsResDto[]> {
    const pets = await this.petService.findAll(userId, query);

    return plainToInstance(FindAllPetsResDto, pets, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<FindOnePetWithBenefitsResDto> {
    const pet = await this.petService.findOne(userId, id);

    return plainToInstance(FindOnePetWithBenefitsResDto, pet, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() body: CreatePetPayloadDto,
  ): Promise<CreatePetResDto> {
    const pet = await this.petService.create(userId, body);
    return plainToInstance(CreatePetResDto, pet, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: UpdatePetPayloadDto,
  ): Promise<UpdatePetResDto> {
    const pet = await this.petService.update(userId, id, body);

    return plainToInstance(UpdatePetResDto, pet, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async delete(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.petService.delete(userId, id);
  }
}
