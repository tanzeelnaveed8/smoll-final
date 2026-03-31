import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { PartnerCost } from './partner.cost.entity';
import { Case } from '../../../modules/case/case.entity';
import { RolesEnum } from '../../../guards/role/role.enum';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { uniqId } from '../../../utils/uniqId';
import { PartnerVet } from './partner.vet.entity';
import { PartnerServices } from './partner.services.entity';
import { PartnerSpeciality } from './partner.speciality.entity';
import { PartnerBooking } from './partner.booking.entity';
import { SmollCareBenefitUsage } from '../../smollcare/entities/smoll-care-benefit-usage.entity';

@Entity()
export class Partner extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: RolesEnum.PARTNER })
  role: RolesEnum;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  receptionistName: string | null;

  @Column('json', { nullable: true })
  clinicImg: FindFileResDto | null;

  @Column('json', { nullable: true })
  imgCollections: FindFileResDto[] | null;

  @Column('json', { nullable: true })
  documents: FindFileResDto[] | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  openingHours: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  country: string | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  postalCode: string | null;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ nullable: true })
  isPending: boolean;

  @Column({ nullable: true })
  timeZone: string | null;

  @ManyToMany(
    () => PartnerSpeciality,
    (partnerSpeciality) => partnerSpeciality.partners,
  )
  @JoinTable()
  specialities: PartnerSpeciality[];

  @ManyToMany(() => Case, (caseEntity) => caseEntity.partners)
  cases: Case[];

  @OneToMany(() => PartnerVet, (partnerVet) => partnerVet.partner)
  vets: PartnerVet[];

  @OneToMany(
    () => PartnerServices,
    (partnerServices) => partnerServices.partner,
  )
  services: PartnerServices[];

  @OneToMany(() => PartnerCost, (partnerCost) => partnerCost.partner)
  partnerCosts: PartnerCost[];

  @OneToMany(() => PartnerBooking, (partnerBooking) => partnerBooking.partner)
  partnerBookings: PartnerBooking[];

  @OneToMany(() => SmollCareBenefitUsage, (usage) => usage.partner)
  smollCareBenefitUsages: SmollCareBenefitUsage[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @BeforeInsert()
  async generateId() {
    this.id = uniqId();
  }
}
