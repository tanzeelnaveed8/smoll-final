import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedVetColumnInSmollCareBenefitUsage1750760693656 implements MigrationInterface {
    name = 'AddedVetColumnInSmollCareBenefitUsage1750760693656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "smoll_care_benefit_usage" ADD "vet" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "smoll_care_benefit_usage" DROP COLUMN "vet"`);
    }

}
