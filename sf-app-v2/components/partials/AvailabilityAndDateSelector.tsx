import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
import { Div, Text } from "react-native-magnus";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react-native";
import { fontHauoraSemiBold } from "@/constant/constant";
import { useState, useCallback } from "react";
import dayjs from "dayjs";

interface Props {
  onSelect?: (date: string) => void;
}

const CalendarHeader = ({ date }: { date: string }) => {
  return (
    <Text
      bg="#FAF8F5"
      fontFamily={fontHauoraSemiBold}
      fontSize={"2xl"}
      lineHeight={32}
      color="#222222"
    >
      {date}
    </Text>
  );
};

const AvailabilityAndDateSelector: React.FC<Props> = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const handleDateSelect = useCallback(
    (date: string) => {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      setSelectedDate(formattedDate);

      if (onSelect) {
        onSelect(formattedDate);
      }
    },
    [onSelect]
  );

  return (
    <Div style={{ height: 136 }} position="relative">
      <CalendarProvider date={selectedDate}>
        <ExpandableCalendar
          disableWeekScroll
          allowShadow={false}
          calendarStyle={{
            borderBottomWidth: 1,
            borderColor: "#E0E0E0",
            paddingBottom: 16,
            paddingHorizontal: 0,
            backgroundColor: "#FAF8F5",
          }}
          headerStyle={{ backgroundColor: "#FAF8F5" }}
          disablePan
          hideKnob
          current={selectedDate}
          animateScroll={true}
          minDate={dayjs().format("YYYY-MM-DD")}
          disableAllTouchEventsForDisabledDays
          renderHeader={(date) => (
            <CalendarHeader date={dayjs(selectedDate).format("dddd, MMM D")} />
          )}
          renderArrow={(direction) => (
            <Div>
              {direction === "left" && dayjs(selectedDate).isAfter(dayjs(), "day") ? (
                <IconChevronLeft size={24} color="#494949" strokeWidth={1.5} />
              ) : direction === "right" ? (
                <IconChevronRight size={24} color="#494949" strokeWidth={1.5} />
              ) : null}
            </Div>
          )}
          onDayPress={(day) => handleDateSelect(day.dateString)}
          theme={{
            calendarBackground: "#FAF8F5",
            selectedDayBackgroundColor: "transparent",
            selectedDayTextColor: "#494949",
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#00adf5", // or your brand color
              selectedTextColor: "#ffffff",
            },
          }}
        />
      </CalendarProvider>
    </Div>
  );
};

export default AvailabilityAndDateSelector;
