import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGroupChatToggle1764572909625 implements MigrationInterface {
    name = 'UpdateGroupChatToggle1764572909625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "domainAccessEnabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "codeAccessEnabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "domainGroupChatEnabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "codeGroupChatEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "codeGroupChatEnabled"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "domainGroupChatEnabled"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "codeAccessEnabled"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "domainAccessEnabled"`);
    }

}
