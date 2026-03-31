import Layout from "@/components/app/Layout";
import { colorPrimary, fontCooper, fontHauoraBold, fontHauoraMedium } from "@/constant/constant";
import { useNotificationStore } from "@/store/modules/notification";
import { NavigationType } from "@/store/types";
import { IconAlertCircle } from "@tabler/icons-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import { Div, Text } from "react-native-magnus";

const windowHeight = Dimensions.get("window").height;

const NotificationScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { fetchNotifications, notifications, readAllNotification } = useNotificationStore();

  const [page, setPage] = useState(1);
  const [nextPageId, setNextPageid] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefreshing?: boolean) => {
    try {
      if (isRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const fetchedData = await fetchNotifications(page, 0.5);
      setNextPageid(fetchedData.nextPage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!nextPageId) return;

    return new Promise<void>(async (resolve) => {
      const newPage = page + 1;
      try {
        const fetchedData = await fetchNotifications(newPage, 20); // commented-out for now
        setNextPageid(fetchedData.nextPage); /// commented-out for now
        setPage(newPage);
      } finally {
        resolve();
      }
    });
  };

  const onStartReached = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const markAllAsRead = async () => {
    try {
      setMarkAllLoading(true);
      await readAllNotification();
    } finally {
      setMarkAllLoading(false);
    }
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const seconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 0) return `${interval} min ago`;
    return `0 min ago`; // Updated to return "0 min ago"
  };

  return (
    <Layout
      title="Notifications"
      showBack
      loading={isLoading}
      onBackPress={() => navigation.goBack()}
    >
      {!isLoading && notifications && notifications.data.length > 0 && (
        <Div mb={24} flexDir="row" justifyContent="space-between">
          <Text fontSize={"lg"} fontFamily={fontHauoraBold}>
            Recent
          </Text>

          <TouchableOpacity onPress={markAllAsRead}>
            <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="primary">
              Mark all as Read
            </Text>
          </TouchableOpacity>
        </Div>
      )}

      <FlatList
        data={notifications?.data}
        ListEmptyComponent={() => (
          <Div h={600} justifyContent="center" alignItems="center">
            <Text
              fontSize={"5xl"}
              textAlign="center"
              fontFamily={fontCooper}
              maxW={"80%"}
              mx={"auto"}
              lineHeight={36}
            >
              No new notifications
            </Text>
          </Div>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={colorPrimary}
            onRefresh={() => fetchData(true)}
          />
        }
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          return (
            <Div
              key={index}
              flexDir="row"
              style={{ gap: 20 }}
              pb={20}
              mb={20}
              borderBottomWidth={1}
              borderBottomColor={
                index + 1 === notifications?.data.length ? "transparent" : "#D0D7DC"
              }
            >
              <Div
                w={40}
                h={40}
                rounded={40}
                bg="#EFEFEF"
                justifyContent="center"
                alignItems="center"
              >
                <IconAlertCircle width={24} height={24} color={"#222222"} />
              </Div>

              <Div>
                <Text
                  fontSize={"lg"}
                  fontFamily={fontHauoraMedium}
                  color="darkGreyText"
                  mb={8}
                  w={290}
                >
                  {item.message}
                </Text>

                <Text fontSize={"md"} fontFamily={fontHauoraMedium} color="#7B7B7B">
                  {timeAgo(item.createdAt)}
                </Text>
              </Div>
            </Div>
          );
        }}
        keyExtractor={(item, i) => i.toString()}
      />
    </Layout>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  pageTitle: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    top: 8,
    zIndex: -1,
  },
});
