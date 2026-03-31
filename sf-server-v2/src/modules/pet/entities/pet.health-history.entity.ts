import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { FindFileResDto } from '../../../modules/file/dto/find.dto';

@Entity()
export class PetHealthHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column('json', { default: [] })
  documents: FindFileResDto[];

  @ManyToOne(() => Pet, (pet) => pet.healthHistory, { onDelete: 'CASCADE' })
  pet: Pet;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
