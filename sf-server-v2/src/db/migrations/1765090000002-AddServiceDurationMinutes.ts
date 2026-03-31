import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceDurationMinutes1765090000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" ADD COLUMN IF NOT EXISTS "durationMinutes" integer NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" DROP COLUMN IF EXISTS "durationMinutes"`,
    );
  }
}
