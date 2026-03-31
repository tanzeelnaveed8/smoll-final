import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupChatIdsToOrganization1764200000000 implements MigrationInterface {
  name = 'AddGroupChatIdsToOrganization1764200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN "domainGroupChatId" varchar(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN "codeGroupChatId" varchar(255)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "codeGroupChatId"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "domainGroupChatId"`
    );
  }
}
