import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVetCustomerToMember1748780000000 implements MigrationInterface {
  name = 'AddIsVetCustomerToMember1748780000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "member" ADD "isVetCustomer" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "isVetCustomer"`);
  }
}

