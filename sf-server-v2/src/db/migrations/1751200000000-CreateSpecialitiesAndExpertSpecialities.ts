import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSpecialitiesAndExpertSpecialities1751200000000 implements MigrationInterface {
    name = 'CreateSpecialitiesAndExpertSpecialities1751200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "specialities" ("id" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_specialities_name" UNIQUE ("name"), CONSTRAINT "PK_specialities_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "expert_specialities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vetId" character varying NOT NULL, "specialityId" character varying NOT NULL, CONSTRAINT "UQ_expert_specialities_vet_speciality" UNIQUE ("vetId", "specialityId"), CONSTRAINT "PK_expert_specialities_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "FK_expert_specialities_vet" FOREIGN KEY ("vetId") REFERENCES "vet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "FK_expert_specialities_speciality" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT IF EXISTS "FK_expert_specialities_speciality"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT IF EXISTS "FK_expert_specialities_vet"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "expert_specialities"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "specialities"`);
    }
}


