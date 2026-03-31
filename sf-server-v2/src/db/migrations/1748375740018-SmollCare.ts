import { MigrationInterface, QueryRunner } from 'typeorm';

export class SmollCare1748375740018 implements MigrationInterface {
  name = 'SmollCare1748375740018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."smoll_care_plan_cycle_enum" AS ENUM('Monthly', 'Yearly')`,
    );
    await queryRunner.query(
      `CREATE TABLE "smoll_care_plan" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "cycle" "public"."smoll_care_plan_cycle_enum" NOT NULL, "stripePriceId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_26edd9c3527116668b50c63287d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "smoll_care_benefit" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "maxUsagePerSubscription" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planId" integer, CONSTRAINT "PK_4e4e2c50a8db77433d9d431c441" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "smoll_care_benefit_usage" ("id" SERIAL NOT NULL, "benefitId" integer NOT NULL, "note" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "subscriptionId" uuid, "partnerId" character varying, "caseId" character varying, CONSTRAINT "PK_3e82ecb12ab42248938a82693ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."smollcare_subscription_status_enum" AS ENUM('Active', 'Expired', 'Revoked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "smollcare_subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."smollcare_subscription_status_enum" NOT NULL, "stripeSubscriptionId" character varying, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "planId" integer, CONSTRAINT "PK_5d4683272653e334145b330a329" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_log_paymenttype_enum" AS ENUM('subscription', 'oneoff')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_log_status_enum" AS ENUM('success', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscriptionId" character varying, "stripePaymentId" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "paymentType" "public"."payment_log_paymenttype_enum" NOT NULL, "status" "public"."payment_log_status_enum" NOT NULL, "metadata" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "memberId" character varying, CONSTRAINT "PK_1b679dd9b2a5aec836097f7e6d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "pet" ADD "careId" character varying`);
    await queryRunner.query(`ALTER TABLE "member" ADD "careId" SERIAL`);
    await queryRunner.query(`ALTER TABLE "member" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "partner_cost" ALTER COLUMN "createdAt" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_cost" ALTER COLUMN "updatedAt" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "weight"`);
    await queryRunner.query(`ALTER TABLE "pet" ADD "weight" integer`);
    await queryRunner.query(
      `ALTER TABLE "member" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit" ADD CONSTRAINT "FK_f71498724705bd6708687f8c2d5" FOREIGN KEY ("planId") REFERENCES "smoll_care_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" ADD CONSTRAINT "FK_514f7a3482486af4a69f1adb809" FOREIGN KEY ("subscriptionId") REFERENCES "smollcare_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" ADD CONSTRAINT "FK_2e49620ffa99146ad70e165cf7c" FOREIGN KEY ("benefitId") REFERENCES "smoll_care_benefit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" ADD CONSTRAINT "FK_a24cc3ebffa1ebbcc17e37a3a61" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" ADD CONSTRAINT "FK_6b5d2b26d7a5b94a140037baf05" FOREIGN KEY ("caseId") REFERENCES "case"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "smollcare_subscription" ADD CONSTRAINT "FK_6a66ccd8d493729b70ff3228390" FOREIGN KEY ("planId") REFERENCES "smoll_care_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_log" ADD CONSTRAINT "FK_41479c877bce1bbaf422f626e95" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_log" DROP CONSTRAINT "FK_41479c877bce1bbaf422f626e95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smollcare_subscription" DROP CONSTRAINT "FK_6a66ccd8d493729b70ff3228390"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" DROP CONSTRAINT "FK_6b5d2b26d7a5b94a140037baf05"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" DROP CONSTRAINT "FK_a24cc3ebffa1ebbcc17e37a3a61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" DROP CONSTRAINT "FK_2e49620ffa99146ad70e165cf7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit_usage" DROP CONSTRAINT "FK_514f7a3482486af4a69f1adb809"`,
    );
    await queryRunner.query(
      `ALTER TABLE "smoll_care_benefit" DROP CONSTRAINT "FK_f71498724705bd6708687f8c2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" ALTER COLUMN "status" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "weight"`);
    await queryRunner.query(`ALTER TABLE "pet" ADD "weight" numeric(5,2)`);
    await queryRunner.query(
      `ALTER TABLE "partner_cost" ALTER COLUMN "updatedAt" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_cost" ALTER COLUMN "createdAt" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "careId"`);
    await queryRunner.query(`ALTER TABLE "pet" DROP COLUMN "careId"`);
    await queryRunner.query(`DROP TABLE "payment_log"`);
    await queryRunner.query(`DROP TYPE "public"."payment_log_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."payment_log_paymenttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "smollcare_subscription"`);
    await queryRunner.query(
      `DROP TYPE "public"."smollcare_subscription_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "smoll_care_benefit_usage"`);
    await queryRunner.query(`DROP TABLE "smoll_care_benefit"`);
    await queryRunner.query(`DROP TABLE "smoll_care_plan"`);
    await queryRunner.query(`DROP TYPE "public"."smoll_care_plan_cycle_enum"`);
  }
}
