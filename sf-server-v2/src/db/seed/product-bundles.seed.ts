/**
 * Seed script to add bundle options, delivery offers, and tags to existing products.
 * Run with: npx ts-node -r tsconfig-paths/register ./src/db/seed/product-bundles.seed.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Product } from '../../modules/product/product.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productRepo = app.get(Repository<Product>);

  console.log('🌱 Starting product bundles seed...');

  // Get all existing products
  const products = await productRepo.find();
  console.log(`Found ${products.length} products`);

  // Sample bundle options for different product types
  const bundleTemplates: Record<string, { id: string; label: string; badge?: string; multiplier: number; priceDelta: number }[]> = {
    default: [
      { id: '1x', label: '1x Pack', badge: '', multiplier: 1, priceDelta: 0 },
      { id: '2x', label: '2x Pack', badge: 'Save 5%', multiplier: 1.9, priceDelta: 0 },
      { id: '3x', label: '3x Pack', badge: 'Save 10%', multiplier: 2.7, priceDelta: 0 },
    ],
    premium: [
      { id: '1x', label: '1x Pack', badge: '', multiplier: 1, priceDelta: 0 },
      { id: '2x', label: '2x Pack', badge: 'Save 10%', multiplier: 1.8, priceDelta: 0 },
      { id: '3x', label: '3x Pack', badge: 'Save 15%', multiplier: 2.55, priceDelta: 0 },
    ],
    small: [
      { id: '1x', label: '1x Pack', badge: '', multiplier: 1, priceDelta: 0 },
      { id: '2x', label: '2x Pack', badge: 'Save 8%', multiplier: 1.84, priceDelta: 0 },
    ],
  };

  // Sample delivery offers
  const deliveryOfferTemplates = [
    { icon: '🚚', text: 'Free delivery on orders over AED 100' },
    { icon: '⚡', text: 'Same-day delivery available' },
    { icon: '📦', text: 'Express delivery within 2 hours' },
  ];

  // Sample tags
  const tagTemplates = [
    { icon: '✓', text: 'Vet approved', color: '#22C55E' },
    { icon: '🌿', text: 'Natural ingredients', color: '#16A34A' },
    { icon: '⭐', text: 'Premium quality', color: '#F59E0B' },
    { icon: '🔬', text: 'Clinically tested', color: '#3B82F6' },
    { icon: '💯', text: '100% Organic', color: '#84CC16' },
  ];

  let updatedCount = 0;

  for (const product of products) {
    try {
      // Skip if product already has bundle options
      if (product.bundleOptions && product.bundleOptions.length > 0) {
        console.log(`⏭️  Skipping "${product.name}" - already has bundles`);
        continue;
      }

      // Determine bundle type based on price
      let bundleTemplate = bundleTemplates.default;
      if (product.price > 50) {
        bundleTemplate = bundleTemplates.premium;
      } else if (product.price < 20) {
        bundleTemplate = bundleTemplates.small;
      }

      // Assign bundle options
      product.bundleOptions = bundleTemplate;

      // Assign delivery offers (rotate through templates)
      const offerIndex = updatedCount % deliveryOfferTemplates.length;
      product.deliveryOffers = [
        deliveryOfferTemplates[offerIndex],
        deliveryOfferTemplates[(offerIndex + 1) % deliveryOfferTemplates.length],
      ];

      // Assign tags (rotate through templates)
      const tagIndex = updatedCount % tagTemplates.length;
      product.tags = [
        tagTemplates[tagIndex],
        tagTemplates[(tagIndex + 2) % tagTemplates.length],
      ];

      await productRepo.save(product);
      updatedCount++;
      console.log(`✅ Updated "${product.name}" with bundles, offers, and tags`);
    } catch (error) {
      console.error(`❌ Error updating "${product.name}":`, error);
    }
  }

  console.log(`\n🎉 Seed completed!`);
  console.log(`   - ${updatedCount} products updated with bundles`);
  console.log(`   - ${products.length - updatedCount} products skipped (already had bundles)`);

  await app.close();
  process.exit(0);
}

bootstrap();
