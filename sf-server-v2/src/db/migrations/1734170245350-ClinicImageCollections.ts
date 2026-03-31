import { MigrationInterface, QueryRunner } from "typeorm";

export class ClinicImageCollections1734170245350 implements MigrationInterface {
    name = 'ClinicImageCollections1734170245350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner" ADD "imgCollections" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner" DROP COLUMN "imgCollections"`);
    }

}
