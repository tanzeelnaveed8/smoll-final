import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAcceptedAtConsultation1765090000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vet_consultation" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP WITH TIME ZONE NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vet_consultation" DROP COLUMN IF EXISTS "acceptedAt"`,
    );
  }
}
