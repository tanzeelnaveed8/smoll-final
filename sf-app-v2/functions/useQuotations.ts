import { useCallback, useState } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCaseStore } from "@/store/modules/case";

export const useQuotations = () => {
  const route = useRoute();
  const { escalatedCases: cases, fetchCases } = useCaseStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextPageId, setNextPageId] = useState<number | null>(1);
  const [page, setPage] = useState(1);

  const comingFrom = (route.params as Record<string, string | undefined>)?.from;

  useFocusEffect(
    useCallback(() => {
      handleFetchCases(undefined, true);
    }, [])
  );

  const handleFetchCases = async (isRefresh?: boolean, reset?: boolean) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetchCases(1, isRefresh ?? reset, true);
      setNextPageId(response.nextPage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageId) return;

    return new Promise<void>(async (resolve) => {
      const newPage = page + 1;
      try {
        const fetchedData = await fetchCases(newPage);
        setNextPageId(fetchedData.nextPage);
        setPage(newPage);
      } finally {
        resolve();
      }
    });
  };

  return {
    cases,
    isLoading,
    isRefreshing,
    handleFetchCases,
    handleLoadMore,
    comingFrom,
  };
};
