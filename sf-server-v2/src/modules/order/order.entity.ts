import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { uniqId } from '../../utils/uniqId';

export type OrderType = 'service' | 'product';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Entity('order')
export class Order extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  memberId: string;

  @Column()
  type: OrderType;

  @Column()
  title: string;

  @Column({ default: 'pending' })
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  total: number;

  @Column({ nullable: true })
  paymentIntentId: string | null;

  @Column('json')
  items: Array<{
    id: string;
    type: OrderType;
    title: string;
    unitPrice: number;
    quantity: number;
    packageId?: string;
    packageLabel?: string;
    addons?: Array<{ id: string; name: string; price: number }>;
    imageUrl?: string;
  }>;

  @Column('json', { nullable: true })
  schedule: {
    dateId?: string;
    labelTop?: string;
    labelBottom?: string;
    time?: string;
  } | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
