import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAdSpotTable1765090000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ad_spot',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'subtitle',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'imageUrl',
            type: 'varchar',
          },
          {
            name: 'actionUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'actionLabel',
            type: 'varchar',
            length: '50',
            default: "'Shop Now'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'position',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'NOW()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ad_spot');
  }
}
