import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOrderTable1765090000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'memberId',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'paymentIntentId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'items',
            type: 'json',
          },
          {
            name: 'schedule',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'IDX_ORDER_MEMBER_ID',
        columnNames: ['memberId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('order', 'IDX_ORDER_MEMBER_ID');
    await queryRunner.dropTable('order');
  }
}
