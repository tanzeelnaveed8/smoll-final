import React, { useEffect, useState } from "react";
import { Button, Div } from "react-native-magnus";
import dayjs from "dayjs";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TouchableOpacity } from "react-native";

interface DatePickerComponentProps {
  value: string;
  onChange: (dob: any) => void;
  py?: number;
  maxDate?: Date;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  value,
  onChange,
  py,
  maxDate,
}) => {
  const [date, setDate] = useState(new Date(value));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDate(new Date(value));
  }, [value]);

  const hideDatePicker = () => {
    setOpen(false);
  };

  const handleConfirm = (date: any) => {
    setDate(date);
    onChange(date);

    hideDatePicker();
  };

  return (
    <Div>
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Button
          py={py ? py : 16}
          px={12}
          fontSize={"xl"}
          rounded={12}
          borderColor="#494949"
          borderWidth={1}
          ripple
          bg="transparent"
          color="#494949"
          w={"100%"}
          textAlign="left"
          style={{ flex: 1, justifyContent: "flex-start" }}
          pointerEvents="none"
        >
          {date ? dayjs(date).format("MMMM DD YYYY") : "Date of birth"}
        </Button>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={open}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        maximumDate={maxDate ? maxDate : undefined}
      />
    </Div>
  );
};

export default DatePickerComponent;
