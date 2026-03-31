import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partner } from './partner.entity';

@Entity()
export class PartnerSpeciality extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Partner, (partner) => partner.specialities)
  partners: Partner[];

  static async seed() {
    const specialityRepo = this.getRepository();

    const specialities = [
      'Equistrain',
      'Hospitalization',
      'Rehabilitation',
      'Xray',
      'Advanced',
      'MRI',
      'Lab tests',
      'Exotic animals',
      'Large animals',
      'Open 24/7',
      'Emergency',
    ];

    for (const name of specialities) {
      const existing = await specialityRepo.findOne({ where: { name } });
      if (!existing) {
        const speciality = specialityRepo.create({ name });
        await specialityRepo.save(speciality);
      }
    }
  }
}
