import { Member } from '../../../modules/member/member.entity';
import { uniqId } from '../../../utils/uniqId';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Vet } from './vet.entity';
import { Case } from '../../../modules/case/case.entity';

@Entity()
export class VetFeedback extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Vet, (vet) => vet.feedbacks)
  vet: Vet;

  @OneToOne(() => Case, (_case) => _case.vetFeedback)
  case: Case;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
