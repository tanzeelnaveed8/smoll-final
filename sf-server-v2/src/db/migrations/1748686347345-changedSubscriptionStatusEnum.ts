import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedSubscriptionStatusEnum1748686347345 implements MigrationInterface {
    name = 'ChangedSubscriptionStatusEnum1748686347345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."smollcare_subscription_status_enum" RENAME TO "smollcare_subscription_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."smollcare_subscription_status_enum" AS ENUM('Active', 'Canceled', 'Revoked')`);
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" ALTER COLUMN "status" TYPE "public"."smollcare_subscription_status_enum" USING "status"::"text"::"public"."smollcare_subscription_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."smollcare_subscription_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."smollcare_subscription_status_enum_old" AS ENUM('Active', 'Expired', 'Revoked')`);
        await queryRunner.query(`ALTER TABLE "smollcare_subscription" ALTER COLUMN "status" TYPE "public"."smollcare_subscription_status_enum_old" USING "status"::"text"::"public"."smollcare_subscription_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."smollcare_subscription_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."smollcare_subscription_status_enum_old" RENAME TO "smollcare_subscription_status_enum"`);
    }

}
