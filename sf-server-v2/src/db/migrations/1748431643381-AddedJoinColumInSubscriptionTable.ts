import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedJoinColumInSubscriptionTable1748431643381 implements MigrationInterface {
    name = 'AddedJoinColumInSubscriptionTable1748431643381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" ADD "petId" character varying`);
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" ADD CONSTRAINT "UQ_f96e17e43a019113575fa3233e5" UNIQUE ("petId")`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "careId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" ADD CONSTRAINT "FK_f96e17e43a019113575fa3233e5" FOREIGN KEY ("petId") REFERENCES "pet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" DROP CONSTRAINT "FK_f96e17e43a019113575fa3233e5"`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "careId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" DROP CONSTRAINT "UQ_f96e17e43a019113575fa3233e5"`);
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" DROP COLUMN "petId"`);
    }

}
