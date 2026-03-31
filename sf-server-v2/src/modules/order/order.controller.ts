import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { AuthUser, GetUser } from 'src/decorators/get-user.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders: Member Role')
@Controller('/orders/members')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(@GetUser() user: AuthUser) {
    return this.orderService.findAllByMember(user.id);
  }

  @Post()
  create(
    @GetUser() user: AuthUser,
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateOrderDto,
  ) {
    return this.orderService.create(user.id, dto);
  }
}
