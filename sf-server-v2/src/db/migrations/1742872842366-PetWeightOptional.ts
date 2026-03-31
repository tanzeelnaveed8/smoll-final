import { MigrationInterface, QueryRunner } from 'typeorm';

export class PetWeightOptional1742872842366 implements MigrationInterface {
  name = 'PetWeightOptional1742872842366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet" ALTER COLUMN "weight" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet" ALTER COLUMN "weight" SET NOT NULL`,
    );
  }
}
