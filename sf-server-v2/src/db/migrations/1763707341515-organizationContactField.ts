import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationContactField1763707341515 implements MigrationInterface {
    name = 'OrganizationContactField1763707341515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "contactDetails" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "organization" ALTER COLUMN "domain" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ALTER COLUMN "domain" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "contactDetails"`);
    }

}
