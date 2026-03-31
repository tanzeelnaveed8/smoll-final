import { MigrationInterface, QueryRunner } from "typeorm";

export class PartnerVetLabelColor1733865074404 implements MigrationInterface {
    name = 'PartnerVetLabelColor1733865074404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_vet" ADD "labelColor" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_vet" DROP COLUMN "labelColor"`);
    }

}
