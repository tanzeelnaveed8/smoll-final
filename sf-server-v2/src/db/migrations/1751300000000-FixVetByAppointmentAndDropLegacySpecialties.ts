import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixVetByAppointmentAndDropLegacySpecialties1751300000000 implements MigrationInterface {
    name = 'FixVetByAppointmentAndDropLegacySpecialties1751300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "vet" ADD COLUMN IF NOT EXISTS "byAppointmentOnly" boolean NOT NULL DEFAULT false`,
        );
        await queryRunner.query(
            `ALTER TABLE "vet" DROP COLUMN IF EXISTS "specialties"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert: remove byAppointmentOnly and add back specialties jsonb
        await queryRunner.query(
            `ALTER TABLE "vet" ADD COLUMN IF NOT EXISTS "specialties" jsonb NOT NULL DEFAULT '[]'`,
        );
        await queryRunner.query(
            `ALTER TABLE "vet" DROP COLUMN IF EXISTS "byAppointmentOnly"`,
        );
    }
}


