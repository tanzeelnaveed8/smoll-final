import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDeleteDateColumnInPetHealth1749037443553 implements MigrationInterface {
    name = 'AddedDeleteDateColumnInPetHealth1749037443553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_health_history" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_health_history" DROP COLUMN "deletedAt"`);
    }

}
