import AppDataSource from '../data-source';

async function seedSpecialities() {
    const dataSource = await AppDataSource.initialize();
    try {
        await dataSource.query(
            `CREATE TABLE IF NOT EXISTS "specialities" ("id" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_specialities_name" UNIQUE ("name"), CONSTRAINT "PK_specialities_id" PRIMARY KEY ("id"))`
        );

        const seeds = ['Pet Nutrition', 'Pet Behaviours', 'Ophthalmology', 'Orthopedic', 'General'];
        for (const name of seeds) {
            await dataSource.query(
                `INSERT INTO "specialities"("id", "name") VALUES (substring(md5(random()::text) for 12), $1) ON CONFLICT ("name") DO NOTHING`,
                [name],
            );
        }

        console.log('Seeded specialities');
    } catch (err) {
        console.error('Failed to seed specialities', err);
        process.exitCode = 1;
    } finally {
        await dataSource.destroy();
    }
}

seedSpecialities();


