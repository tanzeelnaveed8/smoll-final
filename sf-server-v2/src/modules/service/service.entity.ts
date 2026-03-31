import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { uniqId } from '../../utils/uniqId';

@Entity()
export class Service extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'AED' })
  currency: string;

  /** Time needed in minutes (e.g. 30, 60) */
  @Column({ type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  addons: { id?: string; name: string; price: number }[] | null;

  @Column('json', { nullable: true })
  packages: { id?: string; name: string; price: number; highlighted?: boolean; perks?: string[] }[] | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
