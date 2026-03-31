import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Vet } from './vet.entity';
import { Case } from '../../../modules/case/case.entity';
import { ConsultationStatusEnum } from '../enums/consultation-status.enum';
import { Member } from '../../../modules/member/member.entity';
import { uniqId } from '../../../utils/uniqId';

@Entity()
export class VetConsultation extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  status: ConsultationStatusEnum;

  @ManyToOne(() => Member)
  member: Member;

  @OneToOne(() => Case, (_case) => _case.vetConsultation, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  case: Case;

  @ManyToOne(() => Vet, (vet) => vet.consultations)
  vet: Vet;

  @Column({ nullable: true, type: 'timestamptz' })
  scheduledAt: Date | null;

  @Column({ nullable: true })
  rejectedByVetName: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  acceptedAt: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
