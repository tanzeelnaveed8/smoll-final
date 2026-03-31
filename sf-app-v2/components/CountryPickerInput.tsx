import React, { useState } from "react";
import { View, TouchableOpacity, FlatList, Keyboard } from "react-native";
import { Div, Text, Image } from "react-native-magnus";
import InputField from "../components/partials/InputField"; // your custom InputField
import BottomSheet from "../components/partials/BottomSheet"; // your BottomSheet
import { IconSearch } from "@tabler/icons-react-native";

interface CountryOption {
  label: string;
  value: string;
  flag: string;
}

interface Props {
  codes: CountryOption[];
  country: CountryOption;
  setCountry: (val: CountryOption) => void;
}

const CountryPickerInput: React.FC<Props> = ({ codes, country, setCountry }) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter countries by search
  const filteredCountries = codes.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
// console.log("country after selected->",country)
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: "900", marginBottom: 6, color: "#222" }}>
        Country
      </Text>

      {/* InputField as trigger */}
      
      <TouchableOpacity onPress={() => setIsBottomSheetOpen(true)} activeOpacity={0.8}>
      <View pointerEvents="none">
        <InputField
        secureTextEntry={false}
          editable={false}
          value={country.label}
          placeholder="Select Your Country"
          placeholderTextColor="#858B91"
          borderColor="#ddd"
          inputStyle={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            backgroundColor: "transparent",
            height: 48,
            paddingHorizontal: 12,
            fontWeight: "900",
          }}
          prefix={
            country.flag ? (
              <Image w={20} h={20} source={{ uri: country.flag }}  style={{objectFit:"contain"}} />
            ) : (
              <Image
                w={20}
                h={20}
                style={{objectFit:"contain"}}
                source={require("../assets/images/united-arab-emirates.png")}
              />
            )
          }
        />
          </View>
      </TouchableOpacity>
    

      {/* Bottom Sheet */}
      <BottomSheet
        isVisible={isBottomSheetOpen}
        onCloseIconClick={() => setIsBottomSheetOpen(false)}
        title="Select Country"
        showCloseIcon
      >
        {/* Search Input */}
        <InputField
          placeholder="Search"
          bg="#EFEFEF"
          borderRadius={35}
          mt={10}
          borderColor="#EFEFEF"
          prefix={<IconSearch color="#222" />}
          value={searchQuery}
          onChangeText={setSearchQuery}
          secureTextEntry={false}
          
        />

        {/* Country List */}
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.value + item.label}
          keyboardShouldPersistTaps="always"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setCountry(item);
                setIsBottomSheetOpen(false);
                Keyboard.dismiss();
              }}
            >
              <Div
                flexDir="row"
                alignItems="center"
                px={16}
                py={14}
                borderBottomWidth={0.5}
                borderColor="#DEDEDE"
              >
                <Image src={item.flag} w={26} h={18} mr={16} />
                <Text fontSize="lg">{item.label}</Text>
              </Div>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Div px={16} py={14}>
              <Text>No country found</Text>
            </Div>
          )}
        />
      </BottomSheet>
    </View>
  );
};

export default CountryPickerInput;
