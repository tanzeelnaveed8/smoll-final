import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PetHealthHistory } from './pet.health-history.entity';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';
import { Member } from '../../../modules/member/member.entity';
import { Case } from '../../../modules/case/case.entity';
import { PetSpeciesEnum } from '../pet-species.enum';
import { PetGenderEnum } from '../enums/pet-gender.enum';
import { uniqId } from '../../../utils/uniqId';
import { SmollCareSubscription } from '../../smollcare/entities/smoll-care-subscription.entity';

@Entity()
export class Pet extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  weight: number | null;

  @Column()
  species: PetSpeciesEnum;

  @Column()
  spayedOrNeutered: boolean;

  @Column()
  breed: string;

  @Column()
  gender: PetGenderEnum;

  @Column({ nullable: true })
  chipNumber: string | null;

  @Column()
  dob: Date;

  @Column('json', { default: [] })
  photos: FindFileResDto[];

  @Column({ nullable: true })
  preExistingConditions: string | null;

  @Column({ default: false })
  isDeceased: boolean;

  @ManyToOne(() => Member)
  owner: Member;

  @OneToMany(() => PetHealthHistory, (healthHistory) => healthHistory.pet, {
    cascade: true,
  })
  healthHistory: PetHealthHistory[];

  @OneToMany(() => Case, (_case) => _case.pet, {
    cascade: true,
  })
  cases: Case[];

  @Column({ nullable: true })
  careId: string;

  @OneToOne(() => SmollCareSubscription, (subscription) => subscription.pet)
  subscription: SmollCareSubscription;

  @CreateDateColumn({
    type: 'timestamptz',
  })
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
