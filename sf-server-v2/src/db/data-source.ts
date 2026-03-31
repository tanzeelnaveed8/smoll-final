import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://root:example@localhost:5432/postgres',
  ssl: process.env.DB_SSL_CERT
    ? {
      rejectUnauthorized: true,
      ca: process.env.DB_SSL_CERT,
    }
    : false,
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  synchronize: false,
});

export default AppDataSource;
