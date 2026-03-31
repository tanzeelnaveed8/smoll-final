import { MigrationInterface, QueryRunner } from "typeorm";

export class UserStatus1742337807603 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "member" ADD "status" VARCHAR DEFAULT 'active'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "member" DROP COLUMN "status"`
        );
    }
}
