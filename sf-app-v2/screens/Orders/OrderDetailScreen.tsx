import Layout from "@/components/app/Layout";
import {
  colorPrimary,
  fontCooper,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconPackage, IconStethoscope } from "@tabler/icons-react-native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Div, Image, Tag, Text } from "react-native-magnus";
import api from "@/utils/api";

interface OrderDetail {
  id: string;
  type: "service" | "product";
  title: string;
  status: string;
  createdAt: string;
  total: number;
  items: Array<{
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
    date?: string;
  };
  petName?: string;
}

const OrderDetailScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const params = route.params as { id: string; order?: OrderDetail };
  const id = params?.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
    // Poll for updates every 10 seconds to get status changes from admin
    const interval = setInterval(fetchOrderDetail, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/orders/members/${id}`);
      // Change "completed" status to "delivered" for products, keep "completed" for services
      const orderData = { 
        ...data, 
        status: data.status === 'completed' ? (data.type === 'product' ? 'delivered' : 'completed') : data.status 
      };
      setOrder(orderData);
    } catch (err) {
      console.log("Error fetching order detail:", err);
      // Fallback to order from params if API fails
      if (params?.order) {
        // Also transform status for params order
        const orderData = { 
          ...params.order, 
          status: params.order.status === 'completed' ? (params.order.type === 'product' ? 'delivered' : 'completed') : params.order.status 
        };
        setOrder(orderData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !order) {
    return (
      <Layout showBack title="Order Details" onBackPress={() => navigation.goBack()}>
        <Div flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colorPrimary} />
        </Div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout showBack title="Order Details" onBackPress={() => navigation.goBack()}>
        <Div flex={1} justifyContent="center" alignItems="center" px={40}>
          <Text fontSize="xl" fontFamily={fontHauoraBold} color="#6B7280" textAlign="center">
            Order not found
          </Text>
        </Div>
      </Layout>
    );
  }

  const isService = order.type === "service";

  return (
    <Layout showBack title="Order Details" onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.container}>
        {/* Order Header */}
        <Div bg="#FFF" p={20} mb={16} rounded={20} shadow="sm">
          <Div flexDir="row" justifyContent="space-between" alignItems="center" mb={16}>
            <Tag
              bg={isService ? "#ECFDF5" : "#EFF6FF"}
              color={isService ? "#10B981" : "#3B82F6"}
              px={12}
              py={6}
              rounded={12}
              fontSize="sm"
              fontFamily={fontHauoraSemiBold}
            >
              {isService ? "Service Order" : "Product Order"}
            </Tag>
            <Text
              fontSize="sm"
              color="#9CA3AF"
              fontFamily={fontHauoraSemiBold}
            >
              {dayjs(order.createdAt).format("DD MMMM, YYYY")}
            </Text>
          </Div>

          <Text fontSize="2xl" fontFamily={fontHauoraBold} color="#111827" mb={8}>
            {order.title}
          </Text>

          <Div flexDir="row" alignItems="center" mb={8}>
            <Text fontSize="md" fontFamily={fontHauoraMedium} color="#6B7280" mr={8}>
              Status:
            </Text>
            <Text
              fontSize="md"
              fontFamily={fontHauoraSemiBold}
              color={
                order.status === "completed" || order.status === "delivered" ? "#10B981" :
                order.status === "confirmed" ? "#3B82F6" :
                order.status === "cancelled" ? "#EF4444" : "#F59E0B"
              }
              style={{ textTransform: "capitalize" }}
            >
              {order.status}
            </Text>
          </Div>

          {/* Day & Time - Only for Service Orders */}
          {order.type === "service" && order.schedule && (order.schedule.labelTop || order.schedule.time) && (
            <Div flexDir="row" alignItems="center" flexWrap="wrap" mb={12}>
              {order.schedule.labelTop && (
                <Div flexDir="row" alignItems="center" mr={16} mb={4}>
                  <Text fontSize="md" fontFamily={fontHauoraMedium} color="#6B7280" mr={4}>
                    Day:
                  </Text>
                  <Text fontSize="md" fontFamily={fontHauoraBold} color="#111827">
                    {order.schedule.labelTop} {order.schedule.labelBottom || ""}
                  </Text>
                </Div>
              )}
              {order.schedule.time && (
                <Div flexDir="row" alignItems="center" mb={4}>
                  <Text fontSize="md" fontFamily={fontHauoraMedium} color="#6B7280" mr={4}>
                    Time:
                  </Text>
                  <Text fontSize="md" fontFamily={fontHauoraBold} color="#111827">
                    {order.schedule.time}
                  </Text>
                </Div>
              )}
            </Div>
          )}

          <Div flexDir="row" justifyContent="space-between" alignItems="center" pt={12} borderTopWidth={1} borderColor="#F3F4F6">
            <Text fontSize="lg" fontFamily={fontHauoraBold} color="#111827">
              Total Amount
            </Text>
            <Text fontSize="xl" fontFamily={fontHauoraBold} color={colorPrimary}>
              AED {order.total.toFixed(2)}
            </Text>
          </Div>
        </Div>

        {/* Order Items */}
        <Div bg="#FFF" p={20} rounded={20} shadow="sm">
          <Text fontSize="xl" fontFamily={fontHauoraBold} color="#111827" mb={16}>
            Order Items
          </Text>

          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <Div
                key={item.id}
                flexDir="row"
                alignItems="center"
                mb={16}
                pb={index < order.items.length - 1 ? 16 : 0}
                borderBottomWidth={index < order.items.length - 1 ? 1 : 0}
                borderColor="#F3F4F6"
              >
                <Div
                  w={50}
                  h={50}
                  rounded={12}
                  bg={item.type === "service" ? "#ECFDF5" : "#EFF6FF"}
                  justifyContent="center"
                  alignItems="center"
                  mr={12}
                >
                  {item.imageUrl ? (
                    <Image w="100%" h="100%" rounded={12} src={item.imageUrl} />
                  ) : item.type === "service" ? (
                    <IconStethoscope color="#10B981" size={24} />
                  ) : (
                    <IconPackage color="#3B82F6" size={24} />
                  )}
                </Div>

                <Div flex={1}>
                  <Text fontSize="md" fontFamily={fontHauoraSemiBold} color="#111827" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Div flexDir="row" justifyContent="space-between" alignItems="center" mt={4}>
                    <Text fontSize="sm" fontFamily={fontHauoraMedium} color="#6B7280">
                      Qty: {item.quantity || 1}
                    </Text>
                    <Text fontSize="md" fontFamily={fontHauoraBold} color={colorPrimary}>
                      AED {((item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                    </Text>
                  </Div>
                </Div>
              </Div>
            ))
          ) : (
            <Div py={20} alignItems="center">
              <Text fontSize="md" fontFamily={fontHauoraMedium} color="#9CA3AF">
                No items in this order
              </Text>
            </Div>
          )}
        </Div>

        {/* Order Summary */}
        <Div bg="#FFF" p={20} mt={16} mb={32} rounded={20} shadow="sm">
          <Text fontSize="xl" fontFamily={fontHauoraBold} color="#111827" mb={16}>
            Order Summary
          </Text>

          <Div flexDir="row" justifyContent="space-between" mb={8}>
            <Text fontSize="md" fontFamily={fontHauoraMedium} color="#6B7280">
              Order ID
            </Text>
            <Text fontSize="md" fontFamily={fontHauoraSemiBold} color="#111827">
              #{order.id ? order.id.slice(-6).toUpperCase() : 'N/A'}
            </Text>
          </Div>

          <Div flexDir="row" justifyContent="space-between" mb={8}>
            <Text fontSize="md" fontFamily={fontHauoraMedium} color="#6B7280">
              Order Date
            </Text>
            <Text fontSize="md" fontFamily={fontHauoraSemiBold} color="#111827">
              {dayjs(order.createdAt).format("DD MMM, YYYY")}
            </Text>
          </Div>

          <Div flexDir="row" justifyContent="space-between" mb={8}>
            <Text fontSize="md" fontFamily={fontHauoraMedium} color="#6B7280">
              Payment Method
            </Text>
            <Text fontSize="md" fontFamily={fontHauoraSemiBold} color="#111827">
              Online
            </Text>
          </Div>

          <Div flexDir="row" justifyContent="space-between" pt={12} borderTopWidth={1} borderColor="#F3F4F6" mt={8}>
            <Text fontSize="lg" fontFamily={fontHauoraBold} color="#111827">
              Total Paid
            </Text>
            <Text fontSize="lg" fontFamily={fontHauoraBold} color={colorPrimary}>
              AED {order.total.toFixed(2)}
            </Text>
          </Div>
        </Div>

        <Div h={40} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});

export default OrderDetailScreen;
