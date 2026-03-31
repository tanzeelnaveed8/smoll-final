import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedTestHomeVets1748800000000 implements MigrationInterface {
  name = 'SeedTestHomeVets1748800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('Test1234!', 10);

    const vets = [
      {
        id: 'test-home-vet-01',
        name: 'Dr. Ahmed Khan',
        email: 'ahmed.khan@test.com',
        phone: '+923001234501',
        designation: 'Veterinary Surgeon',
        dob: '1985-03-15',
        address: '123 Main Street, Lahore',
        country: 'PK',
        timeZone: 'Asia/Karachi',
      },
      {
        id: 'test-home-vet-02',
        name: 'Dr. Sarah Ali',
        email: 'sarah.ali@test.com',
        phone: '+923001234502',
        designation: 'Animal Dermatologist',
        dob: '1990-07-22',
        address: '456 Park Avenue, Karachi',
        country: 'PK',
        timeZone: 'Asia/Karachi',
      },
      {
        id: 'test-home-vet-03',
        name: 'Dr. Usman Raza',
        email: 'usman.raza@test.com',
        phone: '+923001234503',
        designation: 'Pet Nutritionist',
        dob: '1988-11-05',
        address: '789 Garden Road, Islamabad',
        country: 'PK',
        timeZone: 'Asia/Karachi',
      },
      {
        id: 'test-home-vet-04',
        name: 'Dr. Fatima Noor',
        email: 'fatima.noor@test.com',
        phone: '+923001234504',
        designation: 'Veterinary Cardiologist',
        dob: '1992-01-30',
        address: '321 Blue Area, Rawalpindi',
        country: 'PK',
        timeZone: 'Asia/Karachi',
      },
    ];

    for (const vet of vets) {
      await queryRunner.query(
        `INSERT INTO "vet" ("id", "name", "email", "phone", "password", "role", "isSuspended", "designation", "dob", "address", "country", "timeZone", "isOnline", "byAppointmentOnly", "isHomeVet", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'vet', false, $6, $7, $8, $9, $10, false, false, true, NOW(), NOW())`,
        [
          vet.id,
          vet.name,
          vet.email,
          vet.phone,
          password,
          vet.designation,
          vet.dob,
          vet.address,
          vet.country,
          vet.timeZone,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "vet" WHERE "id" IN ('test-home-vet-01', 'test-home-vet-02', 'test-home-vet-03', 'test-home-vet-04')`,
    );
  }
}
