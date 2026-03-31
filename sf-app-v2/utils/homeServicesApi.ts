/**
 * Home Services & Products API.
 * Fetches from backend /member/services and /member/products only. No mock fallbacks.
 */

import api from "@/utils/api";
import Config from "@/utils/config";
import type {
  ServiceSummary,
  ProductSummary,
  ServiceId,
  ProductId,
} from "@/mocks/homeServices";
import type { ServicePackageOption, ServiceAddonOption } from "@/mocks/serviceDetails";

const ICON_PAIRS: { iconBg: string; iconColor: string }[] = [
  { iconBg: "#FDF2F8", iconColor: "#EC4899" },
  { iconBg: "#EFF6FF", iconColor: "#3B82F6" },
  { iconBg: "#F5F3FF", iconColor: "#8B5CF6" },
  { iconBg: "#ECFDF5", iconColor: "#22C55E" },
  { iconBg: "#FFF7ED", iconColor: "#F97316" },
  { iconBg: "#FEF3C7", iconColor: "#EAB308" },
];

function mapServiceFromApi(
  item: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    durationMinutes?: number | null;
  },
  index: number
): ServiceSummary {
  const icons = ICON_PAIRS[index % ICON_PAIRS.length];
  const price = Number(item.price);
  const mins = item.durationMinutes != null ? Number(item.durationMinutes) : null;
  const durationLabel =
    mins != null ? `${mins} min` : "30-60 min";
  return {
    id: item.id as ServiceId,
    title: item.name,
    description: item.description || "",
    durationLabel,
    priceLabel: `From ${item.currency || "AED"} ${price}`,
    startingPrice: price,
    iconBg: icons.iconBg,
    iconColor: icons.iconColor,
  };
}

function mapProductFromApi(
  item: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    category?: string | null;
    imageUrl?: string | null;
    imageGallery?: string[] | null;
    bundleOptions?: Array<{ id: string; label: string; badge?: string; multiplier: number; priceDelta: number }> | null;
    deliveryOffers?: Array<{ icon: string; text: string }> | null;
    tags?: Array<{ icon: string; text: string; color?: string }> | null;
  },
  index: number
): ProductSummary {
  const rawUrl = item.imageUrl ?? null;
  const imageUrl =
    rawUrl && !/^https?:\/\//i.test(rawUrl)
      ? `${Config.API_URL?.replace(/\/+$/, "")}/${rawUrl.replace(/^\/+/, "")}`
      : rawUrl;

  const gallery =
    Array.isArray(item.imageGallery) && item.imageGallery.length
      ? item.imageGallery.map((u) => {
          if (!u) return u;
          return !/^https?:\/\//i.test(u)
            ? `${Config.API_URL?.replace(/\/+$/, "")}/${u.replace(/^\/+/, "")}`
            : u;
        })
      : null;

  return {
    id: item.id as ProductId,
    title: item.name,
    description: item.description || "",
    priceLabel: `${item.currency || "AED"} ${Number(item.price)}`,
    basePrice: Number(item.price),
    tag: "Vet approved",
    subtitle: item.description || item.name,
    imageUrl,
    imageGallery: gallery,
    bundleOptions: item.bundleOptions || null,
    deliveryOffers: item.deliveryOffers || null,
    tags: item.tags || null,
  };
}

export interface ServicesApiResponse {
  data: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    durationMinutes?: number | null;
  }>;
  count?: number;
}

export interface ProductsApiResponse {
  data: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    category?: string | null;
    imageUrl?: string | null;
    imageGallery?: string[] | null;
  }>;
  count?: number;
}

export async function fetchServicesFromApi(): Promise<ServiceSummary[]> {
  const { data } = await api.get<ServicesApiResponse>("/member/services", {
    params: { limit: 50 },
  });
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map((item, i) => mapServiceFromApi(item, i));
}

export async function fetchProductsFromApi(): Promise<ProductSummary[]> {
  const { data } = await api.get<ProductsApiResponse>("/member/products", {
    params: { limit: 50 },
  });
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map((item, i) => mapProductFromApi(item, i));
}

const currency = "AED";

function mapPackageFromApi(p: { id: string; name: string; price: number; perks?: string[]; highlighted?: boolean }): ServicePackageOption {
  return {
    id: p.id,
    name: p.name,
    priceLabel: `${currency} ${Number(p.price)}`,
    price: Number(p.price),
    perks: Array.isArray(p.perks) ? p.perks : [],
    highlighted: p.highlighted,
  };
}

function mapAddonFromApi(a: { id?: string; name: string; price: number }): ServiceAddonOption {
  return {
    id: a.id || `addon-${a.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: a.name,
    priceLabel: `+${currency} ${Number(a.price)}`,
    price: Number(a.price),
  };
}

export interface ServiceDetailResult {
  service: ServiceSummary | null;
  packages: ServicePackageOption[];
  addons: ServiceAddonOption[];
}

/** Fetches service by id with packages and addons from backend. Returns empty arrays if API does not provide them. */
export async function fetchServiceDetailFromApi(serviceId: string): Promise<ServiceDetailResult> {
  const { data } = await api.get<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    packages?: Array<{ id: string; name: string; price: number; perks?: string[]; highlighted?: boolean }>;
    addons?: Array<{ id: string; name: string; price: number }>;
  }>(`/member/services/${serviceId}`);
  if (!data) {
    return { service: null, packages: [], addons: [] };
  }
  const service = mapServiceFromApi(data, 0);
  const packages = Array.isArray(data.packages) ? data.packages.map(mapPackageFromApi) : [];
  const addons = Array.isArray(data.addons) ? data.addons.map(mapAddonFromApi) : [];
  return { service, packages, addons };
}

export async function fetchServiceByIdFromApi(
  id: string
): Promise<ServiceSummary | null> {
  const { service } = await fetchServiceDetailFromApi(id);
  return service;
}

/** Fetches available time slots for home service booking for a given date (YYYY-MM-DD). Returns [] if endpoint not available or error. */
export async function fetchSlotsFromApi(dateId: string): Promise<string[]> {
  try {
    const { data } = await api.get<{ slots?: string[]; data?: string[] }>(
      "/member/home-services/availability",
      { params: { date: dateId } }
    );
    const list = data?.slots ?? data?.data;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function fetchProductByIdFromApi(
  id: string
): Promise<ProductSummary | null> {
  const { data } = await api.get<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    category?: string | null;
    imageUrl?: string | null;
    imageGallery?: string[] | null;
    bundleOptions?: Array<{ id: string; label: string; badge?: string; multiplier: number; priceDelta: number }> | null;
    deliveryOffers?: Array<{ icon: string; text: string }> | null;
    tags?: Array<{ icon: string; text: string; color?: string }> | null;
  }>(`/member/products/${id}`);
  if (!data) return null;
  return mapProductFromApi(data, 0);
}
