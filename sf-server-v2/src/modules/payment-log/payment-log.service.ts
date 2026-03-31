import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentLog } from './payment-log.entity';
import { CreatePaymentLogDto } from './create.dto';

@Injectable()
export class PaymentLogService {
  constructor(
    @InjectRepository(PaymentLog)
    private paymentLogRepository: Repository<PaymentLog>,
  ) {}

  async createPaymentLog(paymentLog: CreatePaymentLogDto) {
    return this.paymentLogRepository.save({
      ...paymentLog,
    });
  }
}
