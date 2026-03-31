import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FindFileResDto } from '../file/dto/find.dto';
import { Member } from '../member/member.entity';
import { Pet } from '../pet/entities/pet.entity';
import { Partner } from '../partner/entities/partner.entity';
import { PartnerCost } from '../partner/entities/partner.cost.entity';
import { uniqId } from '../../utils/uniqId';
import { CaseStatusEnum } from './enums/case-status.enum';
import { Vet } from '../vet/entities/vet.entity';
import { VetFeedback } from '../vet/entities/vet.feedback.entity';
import { VetConsultation } from '../vet/entities/vet.consultation.entity';
import { PartnerBooking } from '../partner/entities/partner.booking.entity';
import { SmollCareBenefitUsage } from '../smollcare/entities/smoll-care-benefit-usage.entity';

@Entity()
export class Case extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @Column('json', { default: [] })
  assets: FindFileResDto[];

  /** Used for escalation note for partner and conclusion note for vet when closing */
  @Column({ nullable: true })
  vetNote: string | null;

  @Column('json', { default: [] })
  notes: Record<string, string>[];

  @Column('json', { default: [] })
  serviceChecklist: { name: string; checked: boolean }[];

  @Column({ nullable: true, default: false })
  customerNotReachable: boolean;

  @Column({ default: CaseStatusEnum.PENDING })
  status: CaseStatusEnum;

  @Column({ nullable: true })
  isEmergency: boolean | null;

  @Column({ nullable: true })
  isDirectEscalated: boolean | null;

  @Column({ nullable: true, type: 'timestamptz' })
  scheduledAt: Date | null;

  @OneToOne(() => VetConsultation, (consultation) => consultation.case, {
    cascade: ['update'],
    onDelete: 'CASCADE',
  })
  vetConsultation: VetConsultation;

  @OneToOne(() => VetFeedback)
  @JoinColumn()
  vetFeedback: VetFeedback;

  @OneToOne(() => PartnerBooking, (booking) => booking.case, {
    nullable: true,
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  partnerBooking: PartnerBooking;

  @ManyToOne(() => Member, (user) => user.cases)
  member: Member;

  @ManyToOne(() => Pet, (pet) => pet.cases, { onDelete: 'CASCADE' })
  pet: Pet;

  @ManyToOne(() => Vet)
  @JoinColumn()
  assignedVet: Vet;

  @ManyToMany(() => Partner, (clinic) => clinic.cases, { cascade: true })
  @JoinTable()
  partners: Partner[];

  @OneToMany(() => PartnerCost, (partnerCost) => partnerCost.case, {
    cascade: true,
  })
  partnerCosts: PartnerCost[];

  @OneToMany(() => SmollCareBenefitUsage, (usage) => usage.case)
  smollCareBenefitUsages: SmollCareBenefitUsage[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId(true);
  }
}
