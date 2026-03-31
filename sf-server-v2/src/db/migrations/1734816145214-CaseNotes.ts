import { MigrationInterface, QueryRunner } from "typeorm";

export class CaseNotes1734816145214 implements MigrationInterface {
    name = 'CaseNotes1734816145214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case" ADD "notes" json NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case" DROP COLUMN "notes"`);
    }

}
