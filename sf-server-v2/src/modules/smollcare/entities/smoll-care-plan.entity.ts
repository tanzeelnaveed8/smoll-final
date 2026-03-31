import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SmollCareBenefit } from './smoll-care-benefit.entity';
import { SmollCareSubscription } from './smoll-care-subscription.entity';
import { PlanCycle } from '../enums/plan-cycle.enum';

@Entity()
export class SmollCarePlan {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: PlanCycle,
  })
  cycle: PlanCycle;

  @Column()
  stripePriceId: string;

  @OneToMany(() => SmollCareSubscription, (subscription) => subscription.plan)
  subscriptions: SmollCareSubscription[];

  @OneToMany(() => SmollCareBenefit, (benefit) => benefit.plan)
  benefits: SmollCareBenefit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
