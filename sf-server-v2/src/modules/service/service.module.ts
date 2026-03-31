import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { ServiceMemberController } from './service.member.controller';
import { ServiceAvailabilityController } from './service.availability.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [
    ServiceController,
    ServiceMemberController,
    ServiceAvailabilityController,
  ],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
