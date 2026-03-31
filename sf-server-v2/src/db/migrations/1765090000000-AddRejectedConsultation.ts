import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectedConsultation1765090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vet_consultation" ADD COLUMN IF NOT EXISTS "rejectedByVetName" varchar NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vet_consultation" DROP COLUMN IF EXISTS "rejectedByVetName"`,
    );
  }
}
