import { MigrationInterface, QueryRunner } from "typeorm";

export class EmergencyEscalation1733861861943 implements MigrationInterface {
    name = 'EmergencyEscalation1733861861943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case" ADD "isEmergency" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case" DROP COLUMN "isEmergency"`);
    }

}
