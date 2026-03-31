import { useState, useEffect } from "react";
import type { ServiceSummary, ProductSummary } from "@/mocks/homeServices";
import {
  fetchServicesFromApi,
  fetchProductsFromApi,
} from "@/utils/homeServicesApi";

export function useHomeServices(): {
  services: ServiceSummary[];
  products: ProductSummary[];
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        fetchServicesFromApi(),
        fetchProductsFromApi(),
      ]);
      setServices(s);
      setProducts(p);
    } catch {
      setServices([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { services, products, loading, refetch: load };
}
