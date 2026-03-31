import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { RolesEnum } from 'src/guards/role/role.enum';
import { ProductService } from './product.service';
import { FindAllProductQueryDto } from './dto/find.dto';

@ApiTags('Product: Member Role')
@Controller('/member/products')
@ApiBearerAuth()
@UseGuards(AuthGuard(), RoleGuard)
@Roles([RolesEnum.MEMBER])
export class ProductMemberController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() query: FindAllProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
