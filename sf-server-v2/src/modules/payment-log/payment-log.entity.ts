import { Member } from '../member/member.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentType {
  subscription = 'subscription',
  oneoff = 'oneoff',
}

export enum PaymentStatus {
  success = 'success',
  failed = 'failed',
}

@Entity('payment_log')
export class PaymentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  subscriptionId: string | null;

  @Column({ nullable: true })
  stripePaymentId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  metadata: string;

  @ManyToOne(() => Member, (member) => member.paymentLogs)
  member: Member;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
