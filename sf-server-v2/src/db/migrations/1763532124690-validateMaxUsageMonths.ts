import { MigrationInterface, QueryRunner } from "typeorm";

export class ValidateMaxUsageMonths1763532124690 implements MigrationInterface {
    name = 'ValidateMaxUsageMonths1763532124690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "org_code" ADD "maxUsageMonths" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "org_code" DROP COLUMN "maxUsageMonths"`);
    }

}
