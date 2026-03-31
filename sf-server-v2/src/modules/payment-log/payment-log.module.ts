import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentLog } from './payment-log.entity';
import { PaymentLogService } from './payment-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLog])],
  providers: [PaymentLogService],
  exports: [PaymentLogService],
})
export class PaymentLogModule {}
