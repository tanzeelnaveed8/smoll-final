import { Expose } from 'class-transformer';

export class FindSpecialityResDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}

export class FindAllSpecialitiesResDto extends FindSpecialityResDto { }
