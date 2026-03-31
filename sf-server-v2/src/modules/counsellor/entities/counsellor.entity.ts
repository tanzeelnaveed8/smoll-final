import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { uniqId } from '../../../utils/uniqId';
import { Notification } from '../../../modules/notification/notification.entity';
import { RolesEnum } from '../../../guards/role/role.enum';

@Entity()
@Unique(['email', 'phone'])
export class Counsellor extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  name: string | null;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string | null;

  @Column()
  password: string;

  @Column()
  role: RolesEnum = RolesEnum.COUNSELLOR;

  @Column()
  isSuspended: boolean = false;

  @Column({ nullable: true })
  designation: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  country: string | null;

  @Column({ nullable: true })
  timeZone: string | null;

  @Column({ default: false })
  isOnline: boolean;

  @OneToMany(() => Notification, (notification) => notification.forCounsellor)
  notifications: Notification[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
