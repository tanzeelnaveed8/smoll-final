import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Partner } from './partner.entity';
import { Case } from '../../../modules/case/case.entity';
import { PartnerBooking } from './partner.booking.entity';

/**
 * For partner quotations.
 */
@Entity()
export class PartnerCost extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  note: string;

  @Column('jsonb', { nullable: true })
  services: {
    id: string;
    name: string;
    description: string;
    price: number;
    label: string;
  }[];

  /**
   * Whether the member has viewed the quotation.
   */
  @Column({ default: false })
  isViewed: boolean;

  // Note: This is needed for direct escalation by expert.
  // We need the partnerVetId and scheduledAt to book the appointment.
  // Which we usually pass from member perspective when he books.
  // But in case of direct escalation, we need to store it and use it to book the appointment.
  @Column('jsonb', { nullable: true })
  meta: {
    partnerVetId?: string;
    scheduledAt?: Date;
  } | null;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.partnerCosts, {
    onDelete: 'CASCADE',
  })
  case: Case;

  @ManyToOne(() => Partner, (clinic) => clinic.partnerCosts)
  partner: Partner;

  @OneToOne(() => PartnerBooking, (booking) => booking.partnerCost, {
    nullable: true,
  })
  partnerBooking: PartnerBooking | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;
}
