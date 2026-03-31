import { MigrationInterface, QueryRunner } from "typeorm";

export class PetWeightInDecimal1745394703859 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "pet"
            ALTER COLUMN "weight" TYPE DECIMAL(5,2)
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "pet"
            ALTER COLUMN "weight" TYPE INTEGER
          `);
    }

}
