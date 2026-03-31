import { Member } from '../../../modules/member/member.entity';
import { uniqId } from '../../../utils/uniqId';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Partner } from './partner.entity';
import { Case } from '../../../modules/case/case.entity';
import { BookingStatusEnum } from '../booking-status.enum';
import { PartnerVet } from './partner.vet.entity';
import { PartnerCost } from './partner.cost.entity';

@Entity()
export class PartnerBooking extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  status: BookingStatusEnum;

  @Column('jsonb', { nullable: true })
  services: {
    id: string;
    name: string;
    description: string;
    price: number;
    label: string;
  }[];

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Partner)
  partner: Partner;

  @ManyToOne(() => PartnerVet, { nullable: true })
  vet: PartnerVet | null;

  @OneToOne(() => Case, (_case) => _case.partnerBooking, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  case: Case;

  @OneToOne(() => PartnerCost, (cost) => cost.partnerBooking, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  partnerCost: PartnerCost;

  @Column({ nullable: true, type: 'timestamptz' })
  scheduledAt: Date | null;

  @Column()
  paymentIntentId: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
