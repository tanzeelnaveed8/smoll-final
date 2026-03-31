import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Case } from '../case/case.entity';
import { Partner } from '../partner/entities/partner.entity';
import { Vet } from '../vet/entities/vet.entity';
import { Member } from '../member/member.entity';
import { Service } from '../service/service.entity';
import { Product } from '../product/product.entity';
import { PaymentLog } from '../payment-log/payment-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Case, Partner, Vet, Member, Service, Product, PaymentLog])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
