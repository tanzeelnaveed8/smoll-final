import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { uniqId } from '../../utils/uniqId';

@Entity()
export class Product extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 'AED' })
  currency: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  category: string | null;

  @Column({ nullable: true })
  imageUrl: string | null;

  @Column('text', { array: true, nullable: true })
  imageGallery: string[] | null;

  @Column({ default: true })
  isActive: boolean;

  /** Bundle options for quantity-based pricing (e.g., 1x, 2x, 3x packs) */
  @Column('json', { nullable: true })
  bundleOptions: { id: string; label: string; badge?: string; priceDelta: number; multiplier: number }[] | null;

  /** Delivery offers / perks (e.g., "Free delivery on orders over AED 100") */
  @Column('json', { nullable: true })
  deliveryOffers: { icon: string; text: string }[] | null;

  /** Product tags/attributes (e.g., "Vet approved", "Organic") */
  @Column('json', { nullable: true })
  tags: { icon: string; text: string; color?: string }[] | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uniqId();
  }
}
