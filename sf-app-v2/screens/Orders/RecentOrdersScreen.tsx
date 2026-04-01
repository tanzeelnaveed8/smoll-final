import Layout from "@/components/app/Layout";
import { colorPrimary, fontCooper, fontHauoraBold, fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { useFocusEffect } from "@react-navigation/native";
import { IconChevronRight, IconPackage, IconPaw, IconStethoscope } from "@tabler/icons-react-native";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { Div, Image, Tag, Text } from "react-native-magnus";
import api from "@/utils/api";

interface OrderItem {
  id: string;
  type: "service" | "product";
  title: string;
  status: string;
  createdAt: string;
  total: number;
  imageUrl?: string;
  petName?: string;
  items?: Array<{
    id: string;
    type: "service" | "product";
    title: string;
    unitPrice: number;
    quantity: number;
    imageUrl?: string;
  }>;
  schedule?: {
    labelTop?: string;
    labelBottom?: string;
    time?: string;
  };
}

const RecentOrdersScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data } = await api.get("/orders/members");
      // Transform API response to match interface
      const transformedOrders = (Array.isArray(data) ? data : []).map((order: any) => ({
        ...order,
        // Get first item's image if available
        imageUrl: order.items?.[0]?.imageUrl,
        // Change "completed" status: "delivered" for products, "completed" for services
        status: order.status === 'completed' ? (order.type === 'product' ? 'delivered' : 'completed') : order.status,
        // For service orders with schedule, add schedule info to display
        petName: order.schedule?.labelTop
          ? `${order.schedule.labelTop} ${order.schedule.labelBottom || ''}`.trim()
          : undefined,
      }));
      setOrders(transformedOrders);
    } catch (err) {
      console.log("Error fetching orders:", err);
      // Fallback to empty if API doesn't exist yet
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      // Poll for updates every 15 seconds when screen is focused
      const interval = setInterval(fetchOrders, 15000);
      
      return () => clearInterval(interval);
    }, [])
  );

  return (
    <Layout
      showBack
      title="Recent Orders"
      onBackPress={() => navigation.goBack()}
    >
      <Div flex={1} pt={20}>
        {isLoading && !isRefreshing ? (
          <Div flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color={colorPrimary} />
          </Div>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchOrders(true)}
                tintColor={colorPrimary}
              />
            }
            ListEmptyComponent={() => (
              <Div flex={1} mt={100} alignItems="center" px={40}>
                <Text
                  fontSize="4xl"
                  fontFamily={fontCooper}
                  textAlign="center"
                  mb={12}
                >
                  No orders found
                </Text>
                <Text
                  fontSize="lg"
                  fontFamily={fontHauoraSemiBold}
                  color="#6B7280"
                  textAlign="center"
                >
                  Your service bookings and product purchases will appear here.
                </Text>
              </Div>
            )}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={() => {
                  navigation.navigate("OrderDetailScreen", { id: item.id, order: item });
                }}
              />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </Div>
    </Layout>
  );
};

const OrderCard: React.FC<{ order: OrderItem; onPress: () => void }> = ({ order, onPress }) => {
  const isService = order.type === "service";
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Div
        bg="#FFF"
        p={16}
        mb={16}
        rounded={20}
        flexDir="row"
        alignItems="center"
        borderWidth={1}
        borderColor="#F3F4F6"
        shadow="sm"
      >
        <Div
          w={60}
          h={60}
          rounded={16}
          bg={isService ? "#ECFDF5" : "#EFF6FF"}
          justifyContent="center"
          alignItems="center"
          mr={16}
        >
          {order.imageUrl ? (
            <Image w="100%" h="100%" rounded={16} src={order.imageUrl} />
          ) : isService ? (
            <IconStethoscope color="#10B981" size={28} />
          ) : (
            <IconPackage color="#3B82F6" size={28} />
          )}
        </Div>

        <Div flex={1}>
          <Div flexDir="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Tag
              bg={isService ? "#ECFDF5" : "#EFF6FF"}
              color={isService ? "#10B981" : "#3B82F6"}
              px={8}
              py={2}
              rounded={8}
              fontSize="xs"
              fontFamily={fontHauoraSemiBold}
            >
              {isService ? "Service" : "Product"}
            </Tag>
            <Text fontSize="xs" color="#9CA3AF" fontFamily={fontHauoraSemiBold}>
              {dayjs(order.createdAt).format("DD MMM, YYYY")}
            </Text>
          </Div>

          <Text fontSize="lg" fontFamily={fontHauoraBold} color="#111827" mb={2} numberOfLines={1}>
            {order.title}
          </Text>

          <Div flexDir="row" alignItems="center" justifyContent="space-between">
            <Div flexDir="row" alignItems="center">
              {order.petName && (
                <Div flexDir="row" alignItems="center" mr={12}>
                  <IconPaw size={12} color="#6B7280" />
                  <Text fontSize="xs" color="#6B7280" fontFamily={fontHauoraSemiBold} ml={4}>
                    {order.petName}
                  </Text>
                </Div>
              )}
              <Text fontSize="md" fontFamily={fontHauoraBold} color={colorPrimary}>
                AED {order.total.toFixed(2)}
              </Text>
            </Div>
            
            <Div flexDir="row" alignItems="center">
              <Text
                fontSize="xs"
                fontFamily={fontHauoraSemiBold}
                color={
                  order.status === "completed" || order.status === "delivered" ? "#10B981" : 
                  order.status === "confirmed" ? "#3B82F6" : 
                  order.status === "cancelled" ? "#EF4444" : "#F59E0B"
                }
                mr={4}
                style={{ textTransform: "capitalize" }}
              >
                {order.status}
              </Text>
              <IconChevronRight size={16} color="#D1D5DB" />
            </Div>
          </Div>
        </Div>
      </Div>
    </TouchableOpacity>
  );
};

export default RecentOrdersScreen;
