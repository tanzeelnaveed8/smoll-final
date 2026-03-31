import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  CreatePetHealthHistoryPayloadDto,
  CreatePetHealthHistoryResDto,
} from '../dto/create.dto';
import {
  UpdatePetHealthHistoryPayloadDto,
  UpdatePetHealthHistoryResDto,
} from '../dto/update.dto';
import { PetHealthHistoryService } from '../services/pet.health-history.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { RolesEnum } from 'src/guards/role/role.enum';
import { GetUser } from 'src/decorators/get-user.decorator';

@ApiTags('Pet: Member Role')
@Controller('/member/pets')
@ApiCookieAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class PetHealthHistoryController {
  constructor(
    private readonly petHealthHistoryService: PetHealthHistoryService,
  ) {}

  @Post('/:petId/health-history')
  async create(
    @GetUser('id') userId: string,
    @Param('petId') id: string,
    @Body() body: CreatePetHealthHistoryPayloadDto,
  ): Promise<CreatePetHealthHistoryResDto> {
    const healthHistory = await this.petHealthHistoryService.create(
      userId,
      id,
      body,
    );

    return plainToInstance(CreatePetHealthHistoryResDto, healthHistory, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/:petId/health-history/:id')
  async update(
    @GetUser('id') userId: string,
    @Param('petId') petId: string,
    @Param('id') id: string,
    @Body() body: UpdatePetHealthHistoryPayloadDto,
  ): Promise<UpdatePetHealthHistoryResDto> {
    const healthHistory = await this.petHealthHistoryService.update(
      userId,
      petId,
      id,
      body,
    );

    return plainToInstance(UpdatePetHealthHistoryResDto, healthHistory, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/:petId/health-history/:id')
  delete(
    @GetUser('id') userId: string,
    @Param('petId') petId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.petHealthHistoryService.delete(userId, petId, id);
  }
}
