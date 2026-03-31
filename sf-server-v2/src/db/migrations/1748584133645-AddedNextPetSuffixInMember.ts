import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNextPetSuffixInMember1748584133645 implements MigrationInterface {
    name = 'AddedNextPetSuffixInMember1748584133645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "nextPetCareSuffix" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "nextPetCareSuffix"`);
    }

}
