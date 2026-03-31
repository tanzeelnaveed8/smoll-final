import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationAndCodeSchema1760528883146 implements MigrationInterface {
    name = 'OrganizationAndCodeSchema1760528883146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT "FK_expert_specialities_vet"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT "FK_expert_specialities_speciality"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT "UQ_expert_specialities_vet_speciality"`);
        await queryRunner.query(`CREATE TABLE "org_code" ("id" character varying NOT NULL, "code" character varying(6) NOT NULL, "usedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "organizationId" character varying, "usedById" character varying, CONSTRAINT "UQ_6d20a18a4c60640807d9e0756d2" UNIQUE ("code"), CONSTRAINT "PK_5d41ce450c86d7c775ae724a595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("id" character varying NOT NULL, "organizationName" character varying(255) NOT NULL, "domain" character varying(255) NOT NULL, "smollVetAccessStartDate" date, "smollVetAccessEndDate" date, "smollVetIsActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_8fda796a2b3388e30c01d5fa5ee" UNIQUE ("domain"), CONSTRAINT "UQ_8fda796a2b3388e30c01d5fa5ee" UNIQUE ("domain"), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "member" ADD "isPhoneVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "member" ADD "organizationId" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "UQ_d73619f5e63108e8d57e8e1859d"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_nonnull_phone_idx" ON "member" ("phone") WHERE phone IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "unique_nonnull_email_idx" ON "member" ("email") WHERE email IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "UQ_a532a1bc7eb46b39c3c2ec549d9" UNIQUE ("vetId", "specialityId")`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "FK_88fefe735fa4b359cf0eb24dd45" FOREIGN KEY ("vetId") REFERENCES "vet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "FK_01b395e608f432b60c853ceaddb" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "org_code" ADD CONSTRAINT "FK_092c77befcfa1ed04e257976b09" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "org_code" ADD CONSTRAINT "FK_cf4e7d4cb8882137735d0e847b9" FOREIGN KEY ("usedById") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_8122e5920a29af5ef76e2e2ff62" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_8122e5920a29af5ef76e2e2ff62"`);
        await queryRunner.query(`ALTER TABLE "org_code" DROP CONSTRAINT "FK_cf4e7d4cb8882137735d0e847b9"`);
        await queryRunner.query(`ALTER TABLE "org_code" DROP CONSTRAINT "FK_092c77befcfa1ed04e257976b09"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT "FK_01b395e608f432b60c853ceaddb"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT "FK_88fefe735fa4b359cf0eb24dd45"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" DROP CONSTRAINT "UQ_a532a1bc7eb46b39c3c2ec549d9"`);
        await queryRunner.query(`DROP INDEX "public"."unique_nonnull_email_idx"`);
        await queryRunner.query(`DROP INDEX "public"."unique_nonnull_phone_idx"`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "UQ_d73619f5e63108e8d57e8e1859d" UNIQUE ("phone")`);
        await queryRunner.query(`ALTER TABLE "member" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "isPhoneVerified"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "org_code"`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "UQ_expert_specialities_vet_speciality" UNIQUE ("vetId", "specialityId")`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "FK_expert_specialities_speciality" FOREIGN KEY ("specialityId") REFERENCES "specialities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expert_specialities" ADD CONSTRAINT "FK_expert_specialities_vet" FOREIGN KEY ("vetId") REFERENCES "vet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
