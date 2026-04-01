import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdSpotService } from '../modules/ad-spot/ad-spot.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adSpotService = app.get(AdSpotService);

  // Sample ads data
  const adsData = [
    {
      title: '20% OFF First Grooming',
      subtitle: 'Get your pet professionally groomed at 20% discount on first visit',
      imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&h=600&fit=crop',
      actionLabel: 'Book Now',
      actionUrl: '/smoll-home/services',
      position: 'services_top',
      sortOrder: 0,
      isActive: true,
    },
    {
      title: 'Free Health Checkup',
      subtitle: 'Complimentary health checkup with any vaccination service',
      imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&h=600&fit=crop',
      actionLabel: 'Learn More',
      actionUrl: '/smoll-home/services',
      position: 'services_middle',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Premium Pet Food - 15% OFF',
      subtitle: 'High quality nutrition for your furry friend',
      imageUrl: 'https://images.unsplash.com/photo-1589924691195-41432c84c161?w=1200&h=600&fit=crop',
      actionLabel: 'Shop Now',
      actionUrl: '/smoll-home/nutritions',
      position: 'products_top',
      sortOrder: 0,
      isActive: true,
    },
    {
      title: 'Free Delivery on Orders Above AED 100',
      subtitle: 'Get your pet supplies delivered at your doorstep for free',
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=600&fit=crop',
      actionLabel: 'Shop Now',
      actionUrl: '/smoll-home/nutritions',
      position: 'products_middle',
      sortOrder: 1,
      isActive: true,
    },
  ];

  console.log('🌱 Seeding ad spots...');

  for (const adData of adsData) {
    try {
      const created = await adSpotService.create(adData);
      console.log(`✅ Created ad: ${created.title} (${created.position})`);
    } catch (error) {
      console.error(`❌ Failed to create ad: ${adData.title}`, error);
    }
  }

  console.log('✅ Ad spots seeding completed!');
  await app.close();
  process.exit(0);
}

bootstrap();
