import AppDataSource from './data-source';
import { Service } from '../modules/service/service.entity';
import { Product } from '../modules/product/product.entity';

const DEMO_SERVICES = [
  {
    name: 'Pet Grooming',
    description:
      'Full grooming session including bath, haircut, nail trim, ear cleaning, and blow-dry for a fresh and clean pet.',
    price: 120,
    currency: 'AED',
    durationMinutes: 60,
  },
  {
    name: 'Vaccination',
    description:
      'Core and non-core vaccines administered by a licensed vet. Includes health check before vaccination.',
    price: 85,
    currency: 'AED',
    durationMinutes: 20,
  },
  {
    name: 'Health Checkup',
    description:
      'Comprehensive wellness exam covering weight, heart, lungs, skin, teeth, and overall condition.',
    price: 150,
    currency: 'AED',
    durationMinutes: 40,
  },
  {
    name: 'Dental Cleaning',
    description:
      'Professional dental scaling and polishing to remove tartar build-up and prevent gum disease.',
    price: 200,
    currency: 'AED',
    durationMinutes: 45,
  },
  {
    name: 'Deworming',
    description:
      'Safe and effective internal parasite treatment. Suitable for dogs and cats of all ages.',
    price: 60,
    currency: 'AED',
    durationMinutes: 15,
  },
  {
    name: 'Flea & Tick Treatment',
    description:
      'Topical or oral flea and tick prevention treatment. Protects your pet for up to 30 days.',
    price: 95,
    currency: 'AED',
    durationMinutes: 20,
  },
];

const DEMO_PRODUCTS = [
  {
    name: 'Royal Canin Adult Dog Food',
    description:
      'Premium dry food for adult dogs. Supports digestive health, skin & coat. 4kg bag.',
    price: 89,
    currency: 'AED',
    stock: 50,
    category: 'Food',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
  },
  {
    name: 'Multivitamin Chews',
    description:
      'Daily multivitamin soft chews with glucosamine, omega-3, and probiotics. 90 count.',
    price: 45,
    currency: 'AED',
    stock: 100,
    category: 'Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400',
  },
  {
    name: 'Joint & Hip Support',
    description:
      'Glucosamine and chondroitin supplement for joint health. Ideal for senior dogs and large breeds.',
    price: 65,
    currency: 'AED',
    stock: 40,
    category: 'Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-13104dec14a9?w=400',
  },
  {
    name: 'Calming Treats',
    description:
      'Natural calming chews with chamomile and L-theanine. Helps reduce anxiety and stress. 60 count.',
    price: 38,
    currency: 'AED',
    stock: 75,
    category: 'Wellness',
    imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400',
  },
  {
    name: 'Probiotic Powder',
    description:
      'Digestive health probiotic powder. Supports gut flora and immune system. 30 servings.',
    price: 55,
    currency: 'AED',
    stock: 60,
    category: 'Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    name: 'Omega-3 Fish Oil',
    description:
      'Pure fish oil supplement for healthy skin, shiny coat, and heart health. 250ml bottle.',
    price: 42,
    currency: 'AED',
    stock: 80,
    category: 'Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  },
  {
    name: 'SmollCare Complete Wellness Pack',
    description:
      'Bundle of daily multivitamin chews, probiotic powder, omega-3 fish oil and calming treats for all-round wellness.',
    price: 159,
    currency: 'AED',
    stock: 25,
    category: 'Bundles',
    imageUrl:
      'https://images.unsplash.com/photo-1558346547-44399863332a?w=800&auto=format&fit=crop',
    imageGallery: [
      'https://images.unsplash.com/photo-1558346547-44399863332a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop',
    ],
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const serviceRepo = AppDataSource.getRepository(Service);
  const productRepo = AppDataSource.getRepository(Product);

  // Delete all existing services and products
  const existingServices = await serviceRepo.find();
  const existingProducts = await productRepo.find();
  console.log(
    `Deleting ${existingServices.length} services and ${existingProducts.length} products...`,
  );

  if (existingServices.length) await serviceRepo.remove(existingServices);
  if (existingProducts.length) await productRepo.remove(existingProducts);

  // Insert demo services
  for (const s of DEMO_SERVICES) {
    const entity = serviceRepo.create(s);
    await serviceRepo.save(entity);
    console.log(`  + Service: ${entity.name} (${entity.id})`);
  }

  // Insert demo products
  for (const p of DEMO_PRODUCTS) {
    const entity = productRepo.create(p);
    await productRepo.save(entity);
    console.log(`  + Product: ${entity.name} (${entity.id})`);
  }

  console.log('\nDone! 6 services and 7 products seeded.');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
