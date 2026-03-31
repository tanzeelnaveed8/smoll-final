import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { VetAvailability } from '../../../modules/vet/entities/vet.availability.entity';
import { uniqId } from '../../../utils/uniqId';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Partner } from './partner.entity';

@Entity()
export class PartnerVet extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  labelColor: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  about: string | null;

  @Column({ nullable: true })
  isSuspended: boolean | null;

  @Column({ nullable: true })
  designation: string | null;

  @Column('json', { nullable: true })
  profileImg: FindFileResDto | null;

  @Column({ nullable: true })
  yearsOfExperience: number | null;

  @OneToMany(
    () => VetAvailability,
    (vetAvailability) => vetAvailability.partnerVet,
  )
  availabilities: VetAvailability[];

  @ManyToOne(() => Partner, (partner) => partner.vets)
  partner: Partner;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @BeforeInsert()
  async generateId() {
    this.id = uniqId();
  }
}
