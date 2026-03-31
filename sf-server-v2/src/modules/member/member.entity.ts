import { uniqId } from '../../utils/uniqId';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RolesEnum } from '../../guards/role/role.enum';
import { Case } from '../case/case.entity';
import { Notification } from '../notification/notification.entity';
import { Pet } from '../pet/entities/pet.entity';
import { FindFileResDto } from '../file/dto/find.dto';
import { MemberStatusEnum } from './member-status.enum';
import { PaymentLog } from '../payment-log/payment-log.entity';
import { Organization } from '../organization/entities/organization.entity';

@Entity()
export class Member extends BaseEntity {
  @PrimaryColumn()
  id: string;

  // OneSignal user ID
  @Column({ nullable: true })
  playerId: string | null;

  // 📞 Unique phone only when not null
  @Index('unique_nonnull_phone_idx', {
    unique: true,
    where: 'phone IS NOT NULL',
  })
  @Column({ nullable: true })
  phone: string | null;

  // Phone verification status
  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column()
  role: RolesEnum = RolesEnum.MEMBER;

  @Column({ nullable: true })
  stripeCustomerId: string | null;

  // 📧 Unique email only when not null
  @Index('unique_nonnull_email_idx', {
    unique: true,
    where: 'email IS NOT NULL',
  })
  @Column({ nullable: true })
  email: string | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  name: string | null;

  @Column('json', { nullable: true })
  profileImg: FindFileResDto | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  villa: string | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  country: string | null;

  @Column({ nullable: true })
  postalCode: string | null;

  @Column({ nullable: true })
  timeZone: string | null;

  @Column({ default: MemberStatusEnum.ACTIVE })
  status: MemberStatusEnum;

  @Column({ nullable: true, type: 'int', generated: 'increment' })
  careId: number;

  @Column({ default: 0 })
  nextPetCareSuffix: number;

  @OneToMany(() => Pet, (pet) => pet.owner)
  pets: Pet[];

  @OneToMany(() => Case, (_case) => _case.member)
  cases: Case[];

  @OneToMany(() => Notification, (notification) => notification.forMember)
  notifications: Notification[];

  @OneToMany(() => PaymentLog, (paymentLog) => paymentLog.member)
  paymentLogs: PaymentLog[];

  @ManyToOne(() => Organization, { nullable: true })
  organization: Organization | null;

  // Flag to mark members that were created from Vet Admin (home visits)
  @Column({ default: false })
  isVetCustomer: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
