/**
 * Simple seed script to add bundle options to products.
 * Run with: npx ts-node ./src/db/seed/product-bundles-simple.seed.ts
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Get all products
    const products = await dataSource.query('SELECT * FROM product');
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      // Skip if already has bundle options
      if (product.bundleOptions && Array.isArray(product.bundleOptions) && product.bundleOptions.length > 0) {
        console.log(`⏭️  Skipping "${product.name}" - already has bundles`);
        continue;
      }

      // Determine bundle type based on price
      let bundles = [
        { id: '1x', label: '1x Pack', badge: '', multiplier: 1, priceDelta: 0 },
        { id: '2x', label: '2x Pack', badge: 'Save 5%', multiplier: 1.9, priceDelta: 0 },
        { id: '3x', label: '3x Pack', badge: 'Save 10%', multiplier: 2.7, priceDelta: 0 },
      ];

      if (product.price > 50) {
        bundles = [
          { id: '1x', label: '1x Pack', badge: '', multiplier: 1, priceDelta: 0 },
          { id: '2x', label: '2x Pack', badge: 'Save 10%', multiplier: 1.8, priceDelta: 0 },
          { id: '3x', label: '3x Pack', badge: 'Save 15%', multiplier: 2.55, priceDelta: 0 },
        ];
      } else if (product.price < 20) {
        bundles = [
          { id: '1x', label: '1x Pack', badge: '', multiplier: 1, priceDelta: 0 },
          { id: '2x', label: '2x Pack', badge: 'Save 8%', multiplier: 1.84, priceDelta: 0 },
        ];
      }

      // Delivery offers (rotate)
      const allOffers = [
        [{ icon: '🚚', text: 'Free delivery on orders over AED 100' }, { icon: '⚡', text: 'Same-day delivery available' }],
        [{ icon: '📦', text: 'Express delivery within 2 hours' }, { icon: '🚚', text: 'Free delivery on orders over AED 150' }],
        [{ icon: '⚡', text: 'Fast delivery within 24 hours' }, { icon: '📦', text: 'Careful handling guaranteed' }],
      ];
      const offers = allOffers[updatedCount % allOffers.length];

      // Tags (rotate)
      const allTags = [
        [{ icon: '✓', text: 'Vet approved', color: '#22C55E' }, { icon: '🌿', text: 'Natural ingredients', color: '#16A34A' }],
        [{ icon: '⭐', text: 'Premium quality', color: '#F59E0B' }, { icon: '🔬', text: 'Clinically tested', color: '#3B82F6' }],
        [{ icon: '💯', text: '100% Organic', color: '#84CC16' }, { icon: '✓', text: 'Quality guaranteed', color: '#22C55E' }],
      ];
      const tags = allTags[updatedCount % allTags.length];

      await dataSource.query(
        `UPDATE product SET "bundleOptions" = $1, "deliveryOffers" = $2, "tags" = $3 WHERE id = $4`,
        [JSON.stringify(bundles), JSON.stringify(offers), JSON.stringify(tags), product.id]
      );

      updatedCount++;
      console.log(`✅ Updated "${product.name}"`);
    }

    console.log(`\n🎉 Seed completed!`);
    console.log(`   - ${updatedCount} products updated`);
    console.log(`   - ${products.length - updatedCount} products skipped`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

bootstrap();
