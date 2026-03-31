/**
 * AI nutrition recommendations API layer.
 * Backend: POST /member/ai/nutrition-recommendations with pet context;
 * response { productIds: string[] } is resolved against the real product catalog.
 */
import api from "@/utils/api";
import type { ProductSummary } from "@/mocks/homeServices";

export interface AIRecommendationsRequest {
  species?: string;
  breed?: string;
  age?: number;
  weight?: number;
  preExistingConditions?: string;
  petId?: string;
  healthRecords?: { name: string; description: string; date: string }[];
}

export interface AIRecommendationsResponse {
  productIds: string[];
}

const ENDPOINT = "/member/ai/nutrition-recommendations";

/**
 * Fetches AI-based nutrition recommendations for the given pet context.
 * On success returns product IDs from the backend (your model output).
 * On 404/error/offline returns null; caller should use fallback list.
 */
export async function fetchNutritionRecommendations(
  payload: AIRecommendationsRequest
): Promise<string[] | null> {
  try {
    const { data } = await api.post<AIRecommendationsResponse>(ENDPOINT, payload, {
      timeout: 20000,
    });
    if (data?.productIds && Array.isArray(data.productIds)) {
      return data.productIds;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolves product IDs to full product summaries from the given catalog (from API).
 * Unknown IDs are skipped. Returns only resolved products; no mock fallback.
 */
export function resolveProductIdsToSummaries(
  productIds: string[],
  catalog: ProductSummary[]
): ProductSummary[] {
  if (!productIds?.length || !catalog?.length) return [];
  const byId = new Map(catalog.map((p) => [String(p.id), p]));
  return productIds
    .map((id) => byId.get(String(id)))
    .filter((p): p is ProductSummary => p != null);
}
