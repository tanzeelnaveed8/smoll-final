import { useEffect, useState } from "react";
import { useExpertStore } from "@/store/modules/expert";

export const useExperts = (navigation: any) => {
  const { experts, expertDetailMap, fetchExperts, fetchExpertDetail, unreadMessages } =
    useExpertStore();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    fetchAllExperts();
  }, []);

  const fetchAllExperts = async () => {
    try {
      setLoading(true);
      await fetchExperts();
    } finally {
      setLoading(false);
    }
  };

  const handleInboxItemPress = async (expertId: string, expertName: string) => {
    try {
      const expertDetail = expertDetailMap.get(expertId);

      if (!expertDetail) {
        setActionLoading(expertId);
        await fetchExpertDetail(expertId);
      }

      navigation.navigate("ExpertsChatScreen", {
        expertId,
        expertName,
      });
    } finally {
      setActionLoading("");
    }
  };

  return {
    experts,
    unreadMessages,
    expertDetailMap,
    loading,
    actionLoading,
    handleInboxItemPress,
    fetchAllExperts,
  };
};
