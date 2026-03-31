import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { randomCode } from '../utils/randomCode';
import { Member } from '../../member/member.entity';

@Entity()
export class OrgCode extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 6, unique: true })
  code: string;

  /**
   * Maximum validity duration in months from activation date
   * Null means unlimited validity
   */
  @Column({ type: 'int', nullable: true, default: null })
  maxUsageMonths: number | null;

  // Many codes belong to one organization
  @ManyToOne(() => Organization, (org) => org.codes, { onDelete: 'CASCADE' })
  organization: Organization;

  @OneToMany(() => OrgCode, (code) => code.organization)
  orgCodes: OrgCode[];
  // Track usage; null = unused
  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @ManyToOne(() => Member, { nullable: true })
  usedBy: Member;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @BeforeInsert()
  generateCode() {
    this.code = randomCode(6); // e.g., F9M7Q3
    this.id = this.code;
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateMaxUsageMonths() {
    if (this.maxUsageMonths !== null && this.maxUsageMonths !== undefined) {
      const value = this.maxUsageMonths;
      if (!Number.isInteger(value) || value < 1 || value > 24) {
        throw new Error('maxUsageMonths must be an integer between 1 and 24');
      }
    }
  }

  markAsUsed() {
    if (this.usedAt) throw new Error('Code has already been used');
    this.usedAt = new Date();
  }

  isValid(): boolean {
    return !this.usedAt;
  }
}
