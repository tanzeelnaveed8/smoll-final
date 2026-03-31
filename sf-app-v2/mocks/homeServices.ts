/**
 * Mock data for Home Services & Nutritions listings.
 * These are UI-level mocks (not API mocks) used to drive cards and banners.
 */

export type ServiceId =
  | "grooming"
  | "vaccination"
  | "health-checkup"
  | "dental-care"
  | "deworming"
  | "nail-trimming";

export interface ServiceSummary {
  id: ServiceId;
  title: string;
  description: string;
  durationLabel: string;
  /** Display-friendly price label (e.g. "From AED 40"). */
  priceLabel: string;
  /** Numeric starting price used for cart calculations. */
  startingPrice: number;
  iconBg: string;
  iconColor: string;
  /** Optional service image URL from backend. */
  imageUrl?: string | null;
}

export const MOCK_SERVICES: ServiceSummary[] = [
  {
    id: "grooming",
    title: "Grooming",
    description: "Full grooming session including bath, haircut, nail trim, and blow-dry.",
    durationLabel: "45-60 min",
    priceLabel: "From AED 40",
    startingPrice: 40,
    iconBg: "#FDF2F8",
    iconColor: "#EC4899",
  },
  {
    id: "vaccination",
    title: "Vaccination",
    description: "Core and non-core vaccines administered by a licensed vet.",
    durationLabel: "15-20 min",
    priceLabel: "From AED 25",
    startingPrice: 25,
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
  },
  {
    id: "health-checkup",
    title: "Health Checkup",
    description: "Comprehensive wellness exam covering weight, heart, lungs, and more.",
    durationLabel: "30-45 min",
    priceLabel: "From AED 50",
    startingPrice: 50,
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
  },
  {
    id: "dental-care",
    title: "Dental Care",
    description: "Professional dental scaling and polishing to prevent gum disease.",
    durationLabel: "30-40 min",
    priceLabel: "From AED 45",
    startingPrice: 45,
    iconBg: "#F5F3FF",
    iconColor: "#8B5CF6",
  },
  {
    id: "deworming",
    title: "Deworming",
    description: "Safe and effective internal parasite treatment for all ages.",
    durationLabel: "10-15 min",
    priceLabel: "From AED 20",
    startingPrice: 20,
    iconBg: "#ECFDF5",
    iconColor: "#22C55E",
  },
  {
    id: "nail-trimming",
    title: "Nail Trimming",
    description: "Quick and gentle nail trimming by certified pet care specialists.",
    durationLabel: "15-20 min",
    priceLabel: "From AED 15",
    startingPrice: 15,
    iconBg: "#FFF7ED",
    iconColor: "#F97316",
  },
];

export type ProductId =
  | "premium-kibble"
  | "vitamins"
  | "flea-tick"
  | "joint-support"
  | "probiotics"
  | "calming-treats";

export interface ProductBundleOption {
  id: string;
  label: string;
  badge?: string;
  multiplier: number;
  priceDelta: number;
}

export interface ProductDeliveryOffer {
  icon: string;
  text: string;
}

export interface ProductTag {
  icon: string;
  text: string;
  color?: string;
}

export interface ProductSummary {
  id: ProductId;
  title: string;
  description: string;
  /** Primary price label shown on cards (e.g. "AED 34.99"). */
  priceLabel: string;
  /** Numeric base price used for cart calculations. */
  basePrice: number;
  /** Short AI tag like "Good for Bella". */
  tag: string;
  /** Longer subtitle used in AI Picks list. */
  subtitle: string;
  /** Optional product image URL from backend. */
  imageUrl?: string | null;
  /** Optional gallery of additional product images. */
  imageGallery?: string[] | null;
  /** Bundle options for quantity-based pricing (from admin) */
  bundleOptions?: ProductBundleOption[] | null;
  /** Delivery offers/perks (from admin) */
  deliveryOffers?: ProductDeliveryOffer[] | null;
  /** Product tags (from admin) */
  tags?: ProductTag[] | null;
}

export const MOCK_PRODUCTS: ProductSummary[] = [
  {
    id: "premium-kibble",
    title: "Premium Kibble",
    priceLabel: "AED 34.99",
    basePrice: 34.99,
    tag: "Good for Bella",
    description: "Grain-free, all breeds",
    subtitle: "High-protein grain-free formula ideal for active Golden Retrievers",
  },
  {
    id: "vitamins",
    title: "Vitamins",
    priceLabel: "AED 19.99",
    basePrice: 19.99,
    tag: "Good for Bella & Max",
    description: "Daily multivitamin chews",
    subtitle: "Daily multivitamins support immune health for dogs and cats",
  },
  {
    id: "flea-tick",
    title: "Flea & Tick Meds",
    priceLabel: "AED 28.99",
    basePrice: 28.99,
    tag: "Good for Bella",
    description: "Monthly topical treatment",
    subtitle: "Monthly topical treatment for flea and tick prevention",
  },
  {
    id: "joint-support",
    title: "Joint Support",
    priceLabel: "AED 24.99",
    basePrice: 24.99,
    tag: "Good for Bella",
    description: "Glucosamine formula",
    subtitle: "Glucosamine supports hip and joint health in large breeds",
  },
  {
    id: "probiotics",
    title: "Probiotics",
    priceLabel: "AED 16.99",
    basePrice: 16.99,
    tag: "Good for Max",
    description: "Digestive health support",
    subtitle: "Gentle digestive support perfect for sensitive Persian cats",
  },
  {
    id: "calming-treats",
    title: "Calming Treats",
    priceLabel: "AED 14.99",
    basePrice: 14.99,
    tag: "Good for Max",
    description: "Anxiety relief chews",
    subtitle: "Helps reduce anxiety and stress in indoor cats",
  },
];

export type PromoPlacement =
  | "services-row-1"
  | "services-row-2"
  | "products-row-1"
  | "products-row-2";

export interface HomePromo {
  id: string;
  placement: PromoPlacement;
  label: string;
  title: string;
  /** Background color for the banner card. */
  bg: string;
  /** Optional CTA label. */
  ctaLabel?: string;
}

export const MOCK_PROMOS: HomePromo[] = [
  {
    id: "services-grooming-20",
    placement: "services-row-1",
    label: "Sponsored",
    title: "20% OFF First Grooming",
    bg: "#D1C6B8",
    ctaLabel: "Shop Now",
  },
  {
    id: "services-meds-free-delivery",
    placement: "services-row-2",
    label: "Sponsored",
    title: "Free Delivery on Meds",
    bg: "#E0E3EB",
    ctaLabel: "Shop Now",
  },
  {
    id: "products-grooming-20",
    placement: "products-row-1",
    label: "Sponsored",
    title: "20% OFF First Grooming",
    bg: "#D1C6B8",
    ctaLabel: "Shop Now",
  },
  {
    id: "products-meds-free-delivery",
    placement: "products-row-2",
    label: "Sponsored",
    title: "Free Delivery on Meds",
    bg: "#E0E3EB",
    ctaLabel: "Shop Now",
  },
];
