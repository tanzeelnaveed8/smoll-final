import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from '../../pet/entities/pet.entity';
import { SmollCareBenefitUsage } from './smoll-care-benefit-usage.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { SmollCarePlan } from './smoll-care-plan.entity';

@Entity('smollcare_subscription')
export class SmollCareSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Pet, (pet) => pet.subscription)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @OneToMany(() => SmollCareBenefitUsage, (usage) => usage.subscription)
  benefitUsages: SmollCareBenefitUsage[];

  @ManyToOne(() => SmollCarePlan, (plan) => plan.subscriptions)
  plan: SmollCarePlan;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
