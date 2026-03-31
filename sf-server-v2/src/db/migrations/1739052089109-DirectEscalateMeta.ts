import { MigrationInterface, QueryRunner } from 'typeorm';

export class DirectEscalateMeta1739052089109 implements MigrationInterface {
  name = 'DirectEscalateMeta1739052089109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "partner_cost" ADD "meta" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "case" ADD "isDirectEscalated" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case" DROP COLUMN "isDirectEscalated"`,
    );
    await queryRunner.query(`ALTER TABLE "partner_cost" DROP COLUMN "meta"`);
  }
}
