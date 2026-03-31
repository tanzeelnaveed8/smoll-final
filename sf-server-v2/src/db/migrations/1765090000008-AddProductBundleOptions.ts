import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProductBundleOptions1765090000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'bundleOptions',
        type: 'json',
        isNullable: true,
        comment: 'Bundle options for quantity-based pricing (e.g., 1x, 2x, 3x packs)',
      })
    );

    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'deliveryOffers',
        type: 'json',
        isNullable: true,
        comment: 'Delivery offers / perks',
      })
    );

    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'tags',
        type: 'json',
        isNullable: true,
        comment: 'Product tags/attributes',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product', 'bundleOptions');
    await queryRunner.dropColumn('product', 'deliveryOffers');
    await queryRunner.dropColumn('product', 'tags');
  }
}
