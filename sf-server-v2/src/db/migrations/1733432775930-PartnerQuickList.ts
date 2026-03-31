import { MigrationInterface, QueryRunner } from 'typeorm';

export class PartnerQuickList1733432775930 implements MigrationInterface {
  name = 'PartnerQuickList1733432775930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_services" ADD "quickBooking" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_services" DROP COLUMN "quickBooking"`,
    );
  }
}
