import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SmollCareBenefit } from './smoll-care-benefit.entity';
import { Case } from '../../case/case.entity';
import { Partner } from '../../partner/entities/partner.entity';
import { SmollCareSubscription } from './smoll-care-subscription.entity';

@Entity('smoll_care_benefit_usage')
export class SmollCareBenefitUsage {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @ManyToOne(
    () => SmollCareSubscription,
    (subscription) => subscription.benefitUsages,
  )
  subscription: SmollCareSubscription;

  @Column()
  benefitId: number;

  @ManyToOne(() => SmollCareBenefit, (benefit) => benefit.benefitUsages)
  @JoinColumn()
  benefit: SmollCareBenefit;

  @Column({ nullable: true })
  note: string | null;

  @Column({ nullable: true })
  vet: string;

  @ManyToOne(() => Partner, (partner) => partner.smollCareBenefitUsages, {
    nullable: true,
  })
  partner: Partner | null;

  @ManyToOne(() => Case, (_case) => _case.smollCareBenefitUsages, {
    nullable: true,
  })
  case: Case | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
