import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Vet } from './vet.entity';
import { Speciality } from './speciality.entity';

@Entity({ name: 'expert_specialities' })
@Unique(['vetId', 'specialityId'])
export class VetSpeciality extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    vetId: string;

    @Column()
    specialityId: string;

    @ManyToOne(() => Vet, (vet) => vet.vetSpecialities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vetId' })
    vet: Vet;

    @ManyToOne(() => Speciality, (speciality) => speciality.vetSpecialities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'specialityId' })
    speciality: Speciality;
}


