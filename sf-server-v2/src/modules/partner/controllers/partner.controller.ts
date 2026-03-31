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
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from '../../../guards/role/role.enum';
import {
  FindAllPartnerVetsResDto,
  FindAppointmentCalendarQueryDto,
  FindAppointmentCalendarResDto,
  FindOnePartnerVetResDto,
  FindPartnerAppointmentResDto,
  FindPartnerResDto,
  FindPartnerServiceResDto,
  FindPartnerSpecialityResDto,
} from '../dto/find.dto';
import {
  UpdatePartnerPayloadDto,
  UpdatePartnerResDto,
  UpdatePartnerServicePayloadDto,
  UpdatePartnerServiceResDto,
  UpdatePartnerVetPayloadDto,
  UpdatePartnerVetResDto,
} from '../dto/update.dto';
import { PartnerService } from '../services/partner.service';
import {
  CreatePartnerServicePayloadDto,
  CreatePartnerServiceResDto,
  CreatePartnerVetPayloadDto,
  CreatePartnerVetResDto,
} from '../dto/create.dto';
import { ProductService } from '../../product/product.service';

@ApiTags('Partner: Partner Role')
@ApiCookieAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.PARTNER])
@Controller('/partners')
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly productService: ProductService,
  ) {}

  @Get('/me')
  async findMe(@GetUser() user: AuthUser): Promise<FindPartnerResDto> {
    const partner = await this.partnerService.findOne(user.id);

    return plainToInstance(FindPartnerResDto, partner, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/vets')
  async findVets(
    @GetUser() user: AuthUser,
  ): Promise<FindAllPartnerVetsResDto[]> {
    const vets = await this.partnerService.findAllVets(user);

    return plainToInstance(FindAllPartnerVetsResDto, vets, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/vets/:id')
  async findOneVet(
    @Param('id') id: string,
    @GetUser() user: AuthUser,
  ): Promise<FindOnePartnerVetResDto> {
    const vet = await this.partnerService.findOneVet(user, id, {
      availabilities: true,
    });

    return plainToInstance(FindOnePartnerVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/services')
  async findServices(
    @GetUser() user: AuthUser,
  ): Promise<FindPartnerServiceResDto[]> {
    const services = await this.partnerService.findAllServices(user);

    return plainToInstance(FindPartnerServiceResDto, services, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/specialities')
  async findSpecialities(): Promise<FindPartnerSpecialityResDto[]> {
    const specialities = await this.partnerService.findAllSpecialities();

    return plainToInstance(FindPartnerSpecialityResDto, specialities, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/catalog/products')
  async findCatalogProducts() {
    const result = await this.productService.findAll({
      page: 1,
      limit: 500,
    });
    return result;
  }

  @Post('/appointments/:id/reminder')
  async sendReminder(@Param('id') id: string, @GetUser() user: AuthUser) {
    await this.partnerService.sendReminder(user, id);
  }

  @Get('/appointments')
  async findAppointments(
    @GetUser() user: AuthUser,
  ): Promise<FindPartnerAppointmentResDto[]> {
    const appointments = await this.partnerService.findAllAppointments(user);

    return plainToInstance(FindPartnerAppointmentResDto, appointments, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/appointments/calendar')
  async findAppointmentCalendar(
    @GetUser() user: AuthUser,
    @Query() query: FindAppointmentCalendarQueryDto,
  ): Promise<FindAppointmentCalendarResDto> {
    const res = await this.partnerService.findAppointmentCalendar(user, query);

    const appointments = plainToInstance(
      FindPartnerAppointmentResDto,
      res.appointments,
      {
        excludeExtraneousValues: true,
      },
    );

    return { appointments, lastDate: res.lastDate };
  }

  @Post('/appointments/:id/close')
  async closeAppointment(@Param('id') id: string, @GetUser() user: AuthUser) {
    await this.partnerService.closeAppointment(user, id);
  }

  @Post('/vets')
  async createVet(
    @GetUser() user: AuthUser,
    @Body() body: CreatePartnerVetPayloadDto,
  ): Promise<CreatePartnerVetResDto> {
    const vet = await this.partnerService.createVet(user, body);

    return plainToInstance(CreatePartnerVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/services')
  async createService(
    @GetUser() user: AuthUser,
    @Body() body: CreatePartnerServicePayloadDto,
  ): Promise<CreatePartnerServiceResDto> {
    const service = await this.partnerService.createService(user, body);

    return plainToInstance(CreatePartnerServiceResDto, service, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/services/bulk')
  async bulkCreateService(
    @GetUser() user: AuthUser,
    @Body() body: CreatePartnerServicePayloadDto[],
  ) {
    const services = await this.partnerService.createBulkService(user, body);

    return plainToInstance(CreatePartnerServiceResDto, services, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/me')
  async update(
    @GetUser('id') id: string,
    @Body() body: UpdatePartnerPayloadDto,
  ): Promise<UpdatePartnerResDto> {
    const vet = await this.partnerService.update(id, body);

    return plainToInstance(UpdatePartnerResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/vets/:id')
  async updateVet(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdatePartnerVetPayloadDto,
  ): Promise<UpdatePartnerVetResDto> {
    const vet = await this.partnerService.updateVet(user, id, body);
    return plainToInstance(UpdatePartnerVetResDto, vet, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/services/:id')
  async updateService(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdatePartnerServicePayloadDto,
  ): Promise<UpdatePartnerServiceResDto> {
    const service = await this.partnerService.updateService(user, id, body);

    return plainToInstance(UpdatePartnerServiceResDto, service, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/services/:id')
  async deleteService(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.partnerService.deleteService(user, id);
  }

  @Delete('/vets/:id')
  async deleteVet(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.partnerService.deleteVet(user, id);
  }

  @Delete('/appointments/:id')
  async cancelAppointment(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.partnerService.cancelAppointment(user, id);
  }
}
