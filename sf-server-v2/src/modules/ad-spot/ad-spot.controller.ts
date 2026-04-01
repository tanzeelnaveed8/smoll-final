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
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { AdSpotService } from './ad-spot.service';
import { CreateAdSpotDto, UpdateAdSpotDto } from './dto/ad-spot.dto';

@ApiTags('Ad Spots (Sponsored)')
@Controller('ad-spots')
export class AdSpotController {
  constructor(private readonly adSpotService: AdSpotService) {}

  @Get('active')
  findActive(@Query('position') position?: string) {
    return this.adSpotService.findAll(position);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles([RolesEnum.ADMIN])
  create(@Body(new ValidationPipe({ whitelist: true })) dto: CreateAdSpotDto) {
    return this.adSpotService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles([RolesEnum.ADMIN])
  findAll(@Query('position') position?: string) {
    return this.adSpotService.findAll(position);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles([RolesEnum.ADMIN])
  findOne(@Param('id') id: string) {
    return this.adSpotService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles([RolesEnum.ADMIN])
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateAdSpotDto,
  ) {
    return this.adSpotService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles([RolesEnum.ADMIN])
  remove(@Param('id') id: string) {
    return this.adSpotService.remove(id);
  }
}
