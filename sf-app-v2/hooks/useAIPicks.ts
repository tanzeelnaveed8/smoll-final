import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductSummary } from "@/mocks/homeServices";
import { usePetStore } from "@/store/modules/pet";
import {
  fetchNutritionRecommendations,
  resolveProductIdsToSummaries,
} from "@/utils/aiRecommendations";
import { fetchProductsFromApi } from "@/utils/homeServicesApi";

export interface UseAIPicksResult {
  products: ProductSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export function useAIPicks(): UseAIPicksResult {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await withTimeout(fetchProductsFromApi(), 10000);

      if (!catalog.length) {
        setProducts([]);
        return;
      }

      const { pets, petsDetailMap, fetchPets, fetchPetDetails } =
        usePetStore.getState();

      let petDetails: any = null;
      const petsList = pets?.length ? pets : await fetchPets().catch(() => []);

      if (petsList?.length) {
        const firstPet = petsList[0];
        petDetails = petsDetailMap.get(firstPet.id) ?? null;
        if (!petDetails && firstPet.id) {
          try {
            petDetails = await fetchPetDetails(firstPet.id);
          } catch {
            // will send empty payload
          }
        }
      }

      const healthRecords = petDetails?.healthHistory?.length
        ? petDetails.healthHistory.map((h: any) => ({
            name: h.name,
            description: h.description,
            date: h.date,
          }))
        : undefined;

      const payload = petDetails
        ? {
            species: petDetails.species,
            breed: petDetails.breed,
            age: petDetails.age,
            weight: petDetails.weight,
            preExistingConditions: petDetails.preExistingConditions || undefined,
            petId: petDetails.id,
            healthRecords,
          }
        : {};

      const productIds = await withTimeout(
        fetchNutritionRecommendations(payload),
        20000
      );
      const resolved = resolveProductIdsToSummaries(productIds ?? [], catalog);

      if (resolved.length === 0 && catalog.length > 0) {
        setProducts(catalog.slice(0, 5));
      } else {
        setProducts(resolved);
      }
    } catch (e: any) {
      console.error("[useAIPicks] Error:", e);
      setError(null);
      try {
        const fallbackCatalog = await fetchProductsFromApi();
        setProducts(fallbackCatalog.slice(0, 5));
      } catch {
        setError("Could not load recommendations");
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, [load]);

  return { products, loading, error, refetch: load };
}
