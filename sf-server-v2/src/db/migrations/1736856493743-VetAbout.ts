import { MigrationInterface, QueryRunner } from "typeorm";

export class VetAbout1736856493743 implements MigrationInterface {
    name = 'VetAbout1736856493743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vet" ADD "about" character varying`);
        await queryRunner.query(`ALTER TABLE "partner_vet" ADD "about" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_vet" DROP COLUMN "about"`);
        await queryRunner.query(`ALTER TABLE "vet" DROP COLUMN "about"`);
    }

}
