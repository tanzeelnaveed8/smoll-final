import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { OrderService } from './order.service';

@ApiTags('Orders: Admin Role')
@Controller('/orders/admin')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.ADMIN])
export class OrderAdminController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll() {
    return this.orderService.findAllForAdmin();
  }
}
