import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_PACKAGES = [
  {
    id: 'pkg-basic',
    name: 'Basic Care',
    price: 40,
    highlighted: true,
    perks: ['Standard service', 'Health check', 'Report card'],
  },
  {
    id: 'pkg-premium',
    name: 'Premium',
    price: 60,
    highlighted: false,
    perks: ['Everything in Basic', 'Premium products', 'Extended time', 'Photo update'],
  },
  {
    id: 'pkg-deluxe',
    name: 'Deluxe Spa',
    price: 88,
    highlighted: false,
    perks: ['Everything in Premium', 'Luxury treatment', 'Gourmet treat', 'Take-home bandana'],
  },
];

export class SeedServicePackages1765090000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set default packages for all services that don't have packages yet
    await queryRunner.query(
      `UPDATE "service" SET "packages" = $1 WHERE "packages" IS NULL`,
      [JSON.stringify(DEFAULT_PACKAGES)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "service" SET "packages" = NULL`);
  }
}
