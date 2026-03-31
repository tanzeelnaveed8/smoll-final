import { Member } from '../member/member.entity';
import { PaymentStatus } from './payment-log.entity';

import { PaymentType } from './payment-log.entity';

export class CreatePaymentLogDto {
  subscriptionId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  metadata: string;
  member: Member;
}
