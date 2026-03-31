import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SmollCarePlan } from './smoll-care-plan.entity';
import { SmollCareBenefitUsage } from './smoll-care-benefit-usage.entity';

@Entity()
export class SmollCareBenefit {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @ManyToOne(() => SmollCarePlan, (plan) => plan.benefits)
  plan: SmollCarePlan;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  maxUsagePerSubscription: number;

  @OneToMany(() => SmollCareBenefitUsage, (usage) => usage.benefit)
  benefitUsages: SmollCareBenefitUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
