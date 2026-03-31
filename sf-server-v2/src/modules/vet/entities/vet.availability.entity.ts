import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vet } from './vet.entity';
import { PartnerVet } from '../../../modules/partner/entities/partner.vet.entity';

@Entity()
export class VetAvailability extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  dayOfWeek: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  date: Date | null;

  @Column('json')
  intervals: { from: string; to: string }[];

  @ManyToOne(() => Vet, (vet) => vet.availabilities)
  vet: Vet;

  @ManyToOne(() => PartnerVet, (partnerVet) => partnerVet.availabilities, {
    onDelete: 'CASCADE',
  })
  partnerVet: PartnerVet;
}
