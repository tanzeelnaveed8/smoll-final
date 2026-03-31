import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsHomeVetToVet1748795000000 implements MigrationInterface {
  name = 'AddIsHomeVetToVet1748795000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vet" ADD "isHomeVet" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vet" DROP COLUMN "isHomeVet"`);
  }
}

