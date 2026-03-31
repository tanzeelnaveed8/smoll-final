import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogoToOrganizations1764666155534 implements MigrationInterface {
    name = 'AddLogoToOrganizations1764666155534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "profileImg" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "profileImg"`);
    }

}
