import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentLogIdNull1749909016906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_log" ALTER COLUMN "stripePaymentId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_log" ALTER COLUMN "stripePaymentId" SET NOT NULL`,
    );
  }
}
