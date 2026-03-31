import { colorTextPrimary } from "@/constant/constant";
import { IconChevronDown, IconSearch } from "@tabler/icons-react-native";
import React, { ReactElement, useEffect, useState } from "react";
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  Keyboard,
  FlatList,
  ViewStyle,
} from "react-native";
import { Div, Text } from "react-native-magnus";
import BottomSheet from "./BottomSheet";
import InputField from "./InputField";
import RadioButton from "./RadioButton";
import { Nullable } from "@/store/types";
import { StyleSheet } from "react-native";

interface Option {
  label: string;
  value: string;
  flag: string;
}

interface OptionDto extends Option {
  [key: string]: string;
}

interface Props {
  options: Option[];
  showModal?: boolean;
  label?: string;
  marginBottom?: number;
  loading?: boolean;
  showCountryFlag?: boolean;
  selectedValue?: Nullable<Option>;
  onSelect?: (selected: Option) => void;
  onClose?: () => void;
  onOpen?: () => void;
  renderNoOptions?: () => React.ReactNode;
  renderLabel?: (option: OptionDto, onClick: (arg: Option) => void, index: number) => ReactElement;
  mainInputStyle?: StyleProp<TextStyle>;
  disableKeyboardDismissOnSelect?: boolean;
  value?: string;
  style?: StyleProp<ViewStyle>;
}

const SelectInput: React.FC<Props> = (props) => {
  const { renderLabel, mainInputStyle } = props;
  const [selectedValue, setSelectedValue] = useState<Nullable<Option>>(props.selectedValue ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const filteredOptions = props.options.filter((option) =>
    option.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (typeof props.showModal !== "undefined") {
      setShowMenu(props.showModal);
    }
  }, [props.showModal]);

  useEffect(() => {
    if (!props.value || !props.options) return;

    const storedValue = props.options.filter((item) => item.label === props.value)?.pop();

    if (storedValue && selectedValue?.label !== storedValue.label) {
      setSelectedValue(storedValue);
    }
  }, [props.value, props.options]);

  const onSelect = (item: Option) => {
    setSelectedValue(item);

    if (props.onSelect) props.onSelect(item);

    setShowMenu(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShowMenu(true);
          props.onOpen?.();
        }}
        style={props.style}
      >
        <InputField
          placeholder={props.label ?? "Select"}
          suffix={<IconChevronDown color={colorTextPrimary} />}
          loading={props.loading}
          disabled={props.loading}
          readOnly
          pointerEvents="none"
          value={selectedValue?.label || props.selectedValue}
          countryFlag={props.showCountryFlag ? selectedValue?.flag : ""}
          inputStyle={mainInputStyle}
        />
      </TouchableOpacity>

      <BottomSheet
        isVisible={showMenu}
        showCloseIcon
        onCloseIconClick={() => {
          setShowMenu(false);
          props.onClose?.();
        }}
        title={props.label}
        roundedTop={24}
      >
        <InputField
          placeholder="Search"
          bg="#EFEFEF"
          borderRadius={35}
          mt={10}
          borderColor="#EFEFEF"
          prefix={<IconSearch color={colorTextPrimary} />}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value + item.label}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={"always"}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          bounces={true}
          directionalLockEnabled={true}
          renderItem={({ item, index }) =>
            renderLabel ? (
              renderLabel(item as OptionDto, onSelect, index)
            ) : (
              <RadioButton
                key={item.value}
                styles={{
                  borderColor: "transparent",
                }}
                onTap={() => {
                  onSelect(item);
                  if (props.disableKeyboardDismissOnSelect) return;
                  Keyboard.dismiss();
                }}
                label={item.label}
                value={item.value}
                selectedValue={selectedValue?.value ?? ""}
              />
            )
          }
          ListEmptyComponent={() =>
            props.renderNoOptions ? (
              props.renderNoOptions()
            ) : (
              <Div pl={10} pt={10}>
                <Text>No options found</Text>
              </Div>
            )
          }
          contentContainerStyle={styles.flatListContent}
        />
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    flexGrow: 1,
  },
});

export default SelectInput;
