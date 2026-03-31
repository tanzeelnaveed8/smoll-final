import { Member } from '../../../modules/member/member.entity';
import { uniqId } from '../../../utils/uniqId';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Counsellor } from './counsellor.entity';
import { CounsellorSessionStatus } from '../session-status.enum';

@Entity()
export class CounsellorSession extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Counsellor, { nullable: true })
  counsellor: Counsellor;

  @Column({ default: CounsellorSessionStatus.PENDING })
  status: CounsellorSessionStatus;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
