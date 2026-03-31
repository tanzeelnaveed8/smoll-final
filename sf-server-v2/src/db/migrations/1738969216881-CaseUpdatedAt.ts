import { MigrationInterface, QueryRunner } from "typeorm";

export class CaseUpdatedAt1738969216881 implements MigrationInterface {
    name = 'CaseUpdatedAt1738969216881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case" DROP COLUMN "updatedAt"`);
    }

}
