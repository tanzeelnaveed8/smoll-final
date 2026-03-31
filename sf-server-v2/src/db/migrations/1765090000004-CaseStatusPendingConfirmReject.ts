import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Case status: open -> pending, closed -> confirmed.
 * New status 'rejected' is allowed; no data migration needed for it.
 */
export class CaseStatusPendingConfirmReject1765090000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "case"
      SET status = 'pending'
      WHERE status = 'open'
    `);
    await queryRunner.query(`
      UPDATE "case"
      SET status = 'confirmed'
      WHERE status = 'closed'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "case"
      SET status = 'open'
      WHERE status = 'pending'
    `);
    await queryRunner.query(`
      UPDATE "case"
      SET status = 'closed'
      WHERE status = 'confirmed'
    `);
  }
}
