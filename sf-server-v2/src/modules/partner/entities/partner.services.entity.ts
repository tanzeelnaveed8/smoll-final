import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partner } from './partner.entity';

@Entity()
export class PartnerServices extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  currency: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  quickBooking: boolean | null;

  @ManyToOne(() => Partner, (partner) => partner.services)
  partner: Partner;
}
