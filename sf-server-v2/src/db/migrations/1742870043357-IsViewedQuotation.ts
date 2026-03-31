import { MigrationInterface, QueryRunner } from 'typeorm';

export class IsViewedQuotation1742870043357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_cost" ADD COLUMN IF NOT EXISTS "isViewed" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `ALTER TABLE "partner_cost" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );

    await queryRunner.query(
      `ALTER TABLE "partner_cost" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_cost" DROP COLUMN IF EXISTS "updatedAt"`,
    );

    await queryRunner.query(
      `ALTER TABLE "partner_cost" DROP COLUMN IF EXISTS "createdAt"`,
    );

    await queryRunner.query(
      `ALTER TABLE "partner_cost" DROP COLUMN IF EXISTS "isViewed"`,
    );
  }
}
