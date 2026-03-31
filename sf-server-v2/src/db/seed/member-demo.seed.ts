/**
 * Demo members for app login (no Twilio/SendGrid in dev).
 *
 * Run after DB is up and migrations ran:
 *   npm run seed:member-demo
 *
 * Login in app:
 *   Option A – Email: demo@smoll.com
 *   Option B – Phone: +971501111111
 *   → Tap Login → OTP is printed in server console → enter that OTP in the app.
 */

import AppDataSource from '../data-source';

const DEMO_EMAIL = 'demo@smoll.com';
const DEMO_PHONE = '+971501111111';
const DEMO_NAME = 'Demo User';

async function ensureMember(
  ds: any,
  field: 'email' | 'phone',
  value: string,
  name: string,
) {
  const col = field === 'email' ? 'email' : 'phone';
  const existing = await ds.query(
    `SELECT id FROM "member" WHERE ${col} = $1 LIMIT 1`,
    [value],
  );
  if (existing.length > 0) {
    console.log(`✓ Demo member (${col}) already exists (id: ${existing[0].id})`);
    return;
  }
  const isEmail = field === 'email';
  const rows = await ds.query(
    `INSERT INTO "member"
       (id, name, email, phone, role, status,
        "isEmailVerified", "isPhoneVerified",
        "createdAt", "updatedAt")
     VALUES
       (substring(md5(random()::text) for 16),
        $1, $2, $3, 'member', 'active',
        $4, $5,
        now(), now())
     RETURNING id`,
    [name, isEmail ? value : null, isEmail ? null : value, isEmail, !isEmail],
  );
  console.log(`✓ Demo member created (${col}: ${value}, id: ${rows[0].id})`);
}

async function run() {
  const ds = await AppDataSource.initialize();
  try {
    await ensureMember(ds, 'email', DEMO_EMAIL, DEMO_NAME);
    await ensureMember(ds, 'phone', DEMO_PHONE, DEMO_NAME);
    console.log(`  Login: ${DEMO_EMAIL} or ${DEMO_PHONE} → OTP in server console (dev only).`);
  } finally {
    await ds.destroy();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
