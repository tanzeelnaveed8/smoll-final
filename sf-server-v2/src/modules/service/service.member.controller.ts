import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { ServiceService } from './service.service';
import { FindAllServiceQueryDto } from './dto/find.dto';

@ApiTags('Service: Member Role')
@Controller('/member/services')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class ServiceMemberController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  findAll(@Query() query: FindAllServiceQueryDto) {
    return this.serviceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }
}
