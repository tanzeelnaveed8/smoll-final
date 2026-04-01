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

@Entity('ad_spot')
export class AdSpot extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string | null;

  @Column({ nullable: true })
  description: string | null;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  actionUrl: string | null;

  @Column({ default: 'Shop Now' })
  actionLabel: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  position: string | null; // 'services_top', 'services_middle', 'products_top', 'products_middle'

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
