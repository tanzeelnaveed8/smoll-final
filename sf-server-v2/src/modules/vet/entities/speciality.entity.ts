import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { uniqId } from '../../../utils/uniqId';
import { VetSpeciality } from './vet.speciality.entity';

@Entity({ name: 'specialities' })
@Unique(['name'])
export class Speciality extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @OneToMany(() => VetSpeciality, (vetSpeciality) => vetSpeciality.speciality)
    vetSpecialities: VetSpeciality[];

    @BeforeInsert()
    generateId() {
        this.id = uniqId();
    }
}


