import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Member } from '../member/member.entity';
import { Vet } from '../vet/entities/vet.entity';
import { Counsellor } from '../counsellor/entities/counsellor.entity';
import { Partner } from '../partner/entities/partner.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @ApiHideProperty()
  @Exclude()
  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => Member)
  @JoinColumn()
  forMember: Member;

  @ManyToOne(() => Vet)
  @JoinColumn()
  forVet: Vet;

  @ManyToOne(() => Counsellor)
  @JoinColumn()
  forCounsellor: Counsellor;

  @ManyToOne(() => Partner)
  @JoinColumn()
  forPartner: Partner;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
}
