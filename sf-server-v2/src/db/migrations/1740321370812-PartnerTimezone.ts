import { MigrationInterface, QueryRunner } from 'typeorm';

export class PartnerTimezone1740321370812 implements MigrationInterface {
  name = 'PartnerTimezone1740321370812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner" ADD "timeZone" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "partner" DROP COLUMN "timeZone"`);
  }
}
