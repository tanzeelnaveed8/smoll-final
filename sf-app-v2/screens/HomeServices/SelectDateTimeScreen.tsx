import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import {
  colorPrimary,
  fontHauora,
  fontHauoraBold,
  fontHauoraMedium,
} from "@/constant/constant";
import { useCartStore } from "@/store/modules/cart";
import { NavigationType } from "@/store/types";
import { fetchSlotsFromApi } from "@/utils/homeServicesApi";
import { buildUpcomingDates } from "@/utils/scheduleUtils";
import { IconCalendar, IconClock } from "@tabler/icons-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Div, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DATE_PILLS = buildUpcomingDates(7);

const SelectDateTimeScreen: React.FC<Props> = ({ navigation }) => {
  const setSchedule = useCartStore((s) => s.setSchedule);
  const existingSchedule = useCartStore((s) => s.schedule);

  const [selectedDateId, setSelectedDateId] = useState<string>(
    existingSchedule?.dateId ?? DATE_PILLS[0]?.id ?? ""
  );
  const [selectedSlot, setSelectedSlot] = useState<string>(
    existingSchedule?.time ?? ""
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const selectedDate = DATE_PILLS.find((d) => d.id === selectedDateId);

  const loadSlots = useCallback(async (dateId: string) => {
    if (!dateId) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    try {
      const list = await fetchSlotsFromApi(dateId);
      setSlots(list);
      setSelectedSlot((prev) => (list.includes(prev) ? prev : list[0] ?? ""));
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots(selectedDateId);
  }, [selectedDateId, loadSlots]);

  const monthLabel = useMemo(() => {
    const sourceId = selectedDate?.id ?? DATE_PILLS[0]?.id;
    if (!sourceId) {
      const now = new Date();
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }
    const parsed = new Date(sourceId);
    if (Number.isNaN(parsed.getTime())) {
      const now = new Date();
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }
    return `${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }, [selectedDate?.id]);

  const handleContinue = () => {
    if (!selectedDate || !DATE_PILLS.length || !selectedSlot) return;
    setSchedule({
      dateId: selectedDate.id,
      labelTop: selectedDate.labelTop,
      labelBottom: selectedDate.labelBottom,
      time: selectedSlot,
    });
    navigation.navigate("CheckoutScreen");
  };

  return (
    <Layout disableHeader>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Div pt={8} pb={4}>
          <Div mb={8}>
            <BackButton onPress={() => navigation.goBack()} />
          </Div>
          <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color="#1A1C1E" mb={6}>
            Select Date & Time
          </Text>
          <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#74777F">
            Choose a slot that works for you
          </Text>
        </Div>

        <Div flexDir="row" alignItems="center" mt={16} mb={8}>
          <IconCalendar size={18} color={colorPrimary} />
          <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#1A1C1E" ml={8}>
            {monthLabel}
          </Text>
        </Div>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -6 }}
          contentContainerStyle={{ paddingHorizontal: 6 }}
        >
          <Div flexDir="row" style={{ gap: 12 }} py={10}>
            {DATE_PILLS.map((d) => {
              const isActive = d.id === selectedDateId;
              return (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDateId(d.id)}
                  style={[styles.datePill, isActive && styles.datePillActive]}
                >
                  <Text fontSize={10} fontFamily={fontHauoraMedium} color={isActive ? "#FFFFFFCC" : "#74777F"} mb={2}>
                    {d.labelTop}
                  </Text>
                  <Text fontSize={"lg"} fontFamily={fontHauoraBold} color={isActive ? "#FFFFFF" : "#1A1C1E"}>
                    {d.labelBottom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Div>
        </ScrollView>

        <Div flexDir="row" alignItems="center" mt={20} mb={10}>
          <IconClock size={18} color={colorPrimary} />
          <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#1A1C1E" ml={8}>
            Available slots
          </Text>
        </Div>

        {slotsLoading ? (
          <Div py={12} alignItems="center">
            <ActivityIndicator size="small" color={colorPrimary} />
          </Div>
        ) : slots.length === 0 ? (
          <Text fontSize={"sm"} fontFamily={fontHauora} color="#74777F" py={12}>
            No slots available for this date. Try another day or check back later.
          </Text>
        ) : (
          <Div flexDir="row" flexWrap="wrap" style={{ marginHorizontal: -6 }}>
            {slots.map((slot) => {
              const isActive = slot === selectedSlot;
              return (
                <TouchableOpacity
                  key={slot}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSlot(slot)}
                  style={[styles.slotPill, isActive && styles.slotPillActive]}
                >
                  <Text fontSize={"sm"} fontFamily={fontHauoraBold} color={isActive ? colorPrimary : "#111827"}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Div>
        )}

        <Div h={140} />
      </ScrollView>

      <Div
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        bg="#FFFFFF"
        px={20}
        pt={14}
        pb={28}
        borderTopWidth={1}
        borderTopColor="#E5E7EB"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.06,
          shadowRadius: 18,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={handleContinue}
          disabled={!selectedDate || !DATE_PILLS.length || !selectedSlot || slots.length === 0}
        >
          <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#FFFFFF">
            Continue to Payment
          </Text>
        </TouchableOpacity>
      </Div>
    </Layout>
  );
};

export default SelectDateTimeScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 180 },
  datePill: {
    width: 62,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  datePillActive: {
    backgroundColor: colorPrimary,
  },
  slotPill: {
    flexBasis: "30%",
    marginHorizontal: 6,
    marginBottom: 12,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  slotPillActive: {
    borderColor: colorPrimary,
    backgroundColor: "#EEF2FF",
  },
  primaryButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: colorPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
});
