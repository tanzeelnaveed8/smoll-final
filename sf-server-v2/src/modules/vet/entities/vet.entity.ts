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
import { RolesEnum } from '../../../guards/role/role.enum';
import { uniqId } from '../../../utils/uniqId';
import { Notification } from '../../../modules/notification/notification.entity';
import { VetAvailability } from './vet.availability.entity';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { VetConsultation } from './vet.consultation.entity';
import { VetFeedback } from './vet.feedback.entity';
import { VetSpeciality } from './vet.speciality.entity';

@Entity()
@Unique(['email', 'phone'])
export class Vet extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  name: string | null;

  @Column({ nullable: true })
  about: string | null;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string | null;

  @Column()
  password: string;

  @Column()
  role: RolesEnum = RolesEnum.VET;

  @Column()
  isSuspended: boolean = false;

  @Column({ nullable: true })
  designation: string | null;

  @Column()
  dob: Date;

  @Column({ nullable: true })
  yearsOfExperience: number | null;

  @Column('json', { nullable: true })
  documents: FindFileResDto[] | null;

  @Column('json', { nullable: true })
  profileImg: FindFileResDto | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  country: string | null;

  @Column({ nullable: true })
  timeZone: string | null;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  byAppointmentOnly: boolean;

  @OneToMany(() => VetSpeciality, (vs) => vs.vet, { cascade: true })
  vetSpecialities: VetSpeciality[];

  @OneToMany(() => VetConsultation, (consultation) => consultation.vet)
  consultations: VetConsultation[];

  @OneToMany(() => VetAvailability, (availability) => availability.vet)
  availabilities: VetAvailability[];

  @OneToMany(() => Notification, (notification) => notification.forVet)
  notifications: Notification[];

  @OneToMany(() => VetFeedback, (feedback) => feedback.vet)
  feedbacks: VetFeedback[];

  // Flag to mark vets that should appear in Vet Admin (home vets)
  @Column({ default: false })
  isHomeVet: boolean;

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
