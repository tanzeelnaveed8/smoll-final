import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupChatEnabledToOrganization1764140050000 implements MigrationInterface {
  name = 'AddGroupChatEnabledToOrganization1764140050000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN "groupChatEnabled" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "groupChatEnabled"`
    );
  }
}

