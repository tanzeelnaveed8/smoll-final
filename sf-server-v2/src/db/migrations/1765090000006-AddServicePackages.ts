import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServicePackages1765090000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" ADD COLUMN IF NOT EXISTS "packages" json NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" DROP COLUMN IF EXISTS "packages"`,
    );
  }
}
