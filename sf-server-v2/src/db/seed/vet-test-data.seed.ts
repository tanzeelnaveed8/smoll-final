/**
 * Vet Test Data Seed
 * Creates a test vet + member + pet + consultations for local testing.
 *
 * Run:  npm run seed:vet-test
 *
 * Credentials after seeding:
 *   Email:    test-vet@smoll.com
 *   Password: Test1234!
 */

import AppDataSource from '../data-source';
import * as bcrypt from 'bcrypt';

const VET_EMAIL = 'test-vet@smoll.com';
const VET_PASSWORD = 'Test1234!';

async function run() {
  const ds = await AppDataSource.initialize();
  try {
    const hashedPwd = await bcrypt.hash(VET_PASSWORD, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // ── 1. Vet ────────────────────────────────────────────────────────────────
    const existingVet = await ds.query(
      `SELECT id FROM "vet" WHERE email = $1 LIMIT 1`,
      [VET_EMAIL],
    );

    let vetId: string;
    if (existingVet.length > 0) {
      vetId = existingVet[0].id;
      // update password in case it changed
      await ds.query(`UPDATE "vet" SET password = $1 WHERE id = $2`, [
        hashedPwd,
        vetId,
      ]);
      console.log(`✓ Vet already exists   (id: ${vetId})`);
    } else {
      const rows = await ds.query(
        `INSERT INTO "vet"
           (id, name, phone, email, password, role, "isSuspended",
            designation, dob, "timeZone", "isOnline", "byAppointmentOnly",
            "createdAt", "updatedAt")
         VALUES
           (substring(md5(random()::text) for 16),
            'Dr. Test Vet', '+971500000001', $1, $2,
            'vet', false,
            'General Veterinarian', '1990-01-01',
            'Asia/Dubai', true, false,
            now(), now())
         RETURNING id`,
        [VET_EMAIL, hashedPwd],
      );
      vetId = rows[0].id;
      console.log(`✓ Vet created          (id: ${vetId})`);
    }

    // ── 2. Member ─────────────────────────────────────────────────────────────
    const existingMember = await ds.query(
      `SELECT id FROM "member" WHERE email = 'test-member@smoll.com' LIMIT 1`,
    );

    let memberId: string;
    if (existingMember.length > 0) {
      memberId = existingMember[0].id;
      console.log(`✓ Member already exists (id: ${memberId})`);
    } else {
      const rows = await ds.query(
        `INSERT INTO "member"
           (id, name, phone, email, role, status,
            address, villa, city, country,
            "isEmailVerified", "isPhoneVerified",
            "timeZone", "createdAt", "updatedAt")
         VALUES
           (substring(md5(random()::text) for 16),
            'Ahmed Al Mansoori', '+971501234567', 'test-member@smoll.com',
            'member', 'active',
            'Al Wasl Road, Building 12', 'Villa 5', 'Dubai', 'UAE',
            true, true,
            'Asia/Dubai', now(), now())
         RETURNING id`,
      );
      memberId = rows[0].id;
      console.log(`✓ Member created        (id: ${memberId})`);
    }

    // ── 3. Pet ────────────────────────────────────────────────────────────────
    const existingPet = await ds.query(
      `SELECT id FROM "pet" WHERE name = 'Buddy' AND "ownerId" = $1 LIMIT 1`,
      [memberId],
    );

    let petId: string;
    if (existingPet.length > 0) {
      petId = existingPet[0].id;
      console.log(`✓ Pet already exists    (id: ${petId})`);
    } else {
      const rows = await ds.query(
        `INSERT INTO "pet"
           (id, name, age, weight, species, "spayedOrNeutered",
            breed, gender, dob, photos, "ownerId",
            "preExistingConditions", "createdAt", "updatedAt")
         VALUES
           (substring(md5(random()::text) for 16),
            'Buddy', 3, 15.5, 'dog', false,
            'Golden Retriever', 'male', '2021-06-15',
            '[]'::json, $1,
            'Mild seasonal allergies',
            now(), now())
         RETURNING id`,
        [memberId],
      );
      petId = rows[0].id;
      console.log(`✓ Pet created           (id: ${petId})`);
    }

    // ── 4. Cases ──────────────────────────────────────────────────────────────
    const case1 = await ds.query(
      `INSERT INTO "case"
         (id, description, assets, notes, "serviceChecklist",
          status, "memberId", "petId", "assignedVetId",
          "createdAt", "updatedAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'Buddy has been limping on his front left leg for 2 days. Possible sprain. No visible wound.',
          '[]'::json, '[]'::json, '[]'::json,
          'pending', $1, $2, $3,
          now(), now())
       RETURNING id`,
      [memberId, petId, vetId],
    );

    const case2 = await ds.query(
      `INSERT INTO "case"
         (id, description, assets, notes, "serviceChecklist",
          status, "memberId", "petId", "assignedVetId",
          "createdAt", "updatedAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'Annual checkup and vaccination follow-up. Owner reports mild lethargy.',
          '[]'::json, '[]'::json, '[]'::json,
          'pending', $1, $2, $3,
          now(), now())
       RETURNING id`,
      [memberId, petId, vetId],
    );

    const case3 = await ds.query(
      `INSERT INTO "case"
         (id, description, assets, notes, "serviceChecklist",
          status, "memberId", "petId", "assignedVetId",
          "createdAt", "updatedAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'Completed case: routine dental check. No issues found.',
          '[]'::json, '[]'::json, '[]'::json,
          'confirmed', $1, $2, $3,
          now() - interval '2 days', now())
       RETURNING id`,
      [memberId, petId, vetId],
    );

    console.log(`✓ 3 cases created`);

    // ── 5. VetConsultations ───────────────────────────────────────────────────
    // Scheduled tomorrow — linked to case1 (to test Accept/Reject + view details)
    await ds.query(
      `INSERT INTO "vet_consultation"
         (id, status, "memberId", "vetId", "caseId", "scheduledAt", "createdAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'scheduled', $1, $2, $3, $4, now())`,
      [memberId, vetId, case1[0].id, tomorrow],
    );

    // Scheduled day-after — linked to case2
    await ds.query(
      `INSERT INTO "vet_consultation"
         (id, status, "memberId", "vetId", "caseId", "scheduledAt", "createdAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'scheduled', $1, $2, $3, $4, now())`,
      [memberId, vetId, case2[0].id, dayAfter],
    );

    // Instant initiated
    await ds.query(
      `INSERT INTO "vet_consultation"
         (id, status, "memberId", "vetId", "createdAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'initiated', $1, $2, now())`,
      [memberId, vetId],
    );

    // Completed (2 days ago) — linked to case3
    await ds.query(
      `INSERT INTO "vet_consultation"
         (id, status, "memberId", "vetId", "caseId", "createdAt")
       VALUES
         (substring(md5(random()::text) for 16),
          'completed', $1, $2, $3, now() - interval '2 days')`,
      [memberId, vetId, case3[0].id],
    );

    console.log(`✓ 4 consultations created (2 scheduled, 1 instant, 1 completed)`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Vet Dashboard Test Credentials');
    console.log('  Email:    test-vet@smoll.com');
    console.log('  Password: Test1234!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await ds.destroy();
  }
}

run();
