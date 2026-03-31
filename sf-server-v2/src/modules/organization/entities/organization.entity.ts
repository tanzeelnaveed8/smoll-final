import { uniqId } from '../../../utils/uniqId';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { OrgCode } from './org-code.entity';
import { Member } from '../../member/member.entity';
import { FindFileResDto } from '../../file/dto/find.dto';
@Entity()
@Unique(['domain'])
export class Organization extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  organizationName: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactDetails: string | null;

  // --- smollVet access fields ---
  @Column({ type: 'date', nullable: true })
  smollVetAccessStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  smollVetAccessEndDate: Date | null;

  @Column({ type: 'boolean', default: false })
  smollVetIsActive: boolean;

  @Column({ type: 'boolean', default: false })
  domainAccessEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  codeAccessEnabled: boolean;

  // -----------------------------

  @Column({ type: 'boolean', default: false })
  groupChatEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  domainGroupChatEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  codeGroupChatEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domainGroupChatId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  codeGroupChatId: string | null;

  @Column('json', { nullable: true })
  profileImg: FindFileResDto | null;

  // One-to-many relation with OrgCode
  @OneToMany(() => OrgCode, (code) => code.organization)
  codes: OrgCode[];

  @OneToMany(() => Member, (member) => member.organization)
  members: Member[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }

  /**
   * Helper to activate smollVet access for 365 days from today
   */
  activateSmollVetAccess() {
    const today = new Date();
    this.smollVetAccessStartDate = today;
    this.smollVetAccessEndDate = new Date(today.setDate(today.getDate() + 365));
    this.smollVetIsActive = true;
  }

  /**
   * Check if smollVet access is currently valid
   */
  isSmollVetAccessValid(): boolean {
    if (
      !this.smollVetIsActive ||
      !this.smollVetAccessStartDate ||
      !this.smollVetAccessEndDate
    )
      return false;

    const today = new Date();
    const accessStartDate = new Date(this.smollVetAccessStartDate);
    const accessEndDate = new Date(this.smollVetAccessEndDate);

    return (
      today >= accessStartDate &&
      today <= accessEndDate &&
      this.smollVetIsActive
    );
  }
}
