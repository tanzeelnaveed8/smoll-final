import api from "./api";
import * as AsyncStorageService from "./async-storage";
import { CountryApiResDto, CountryCodeDto } from "./types";

export async function getCountryCodes(): Promise<CountryCodeDto[]> {
  const codes = await AsyncStorageService.getItem<CountryCodeDto[] | null>("countryCodes");

  if (codes === null) {
    const { data } = await api.get<CountryApiResDto[]>(
      "https://restcountries.com/v3.1/alpha?codes=ae,in&fields=flags,idd,name"
    );

    const refinedData: CountryCodeDto[] = data.map((e) => ({
      flag: e.flags.png,
      name: e.name.common,
      code: e.idd.root + (e.idd.suffixes?.[0] || ""),
    }));

    return refinedData;
  }

  return codes;
}

// filtered state field value from nominatim api
export const uaeCities = [
  {
    label: "Abu Dhabi",
    value: "abu dhabi",
    state: "Abu Dhabi Emirate",
  },
  { label: "Dubai", value: "dubai", state: "Dubai" },
  { label: "Sharjah", value: "sharjah", state: "Sharjah Emirate" },
  { label: "Ajman", value: "ajman", state: "Ajman Emirate" },
  { label: "Umm Al Quwain", value: "umm al quwain", state: "Umm al-Quwain" },
  { label: "Ras Al Khaimah", value: "ras al khaimah", state: "Ras al-Khaimah" },
  { label: "Fujairah", value: "fujairah", state: "Fujairah Emirate" },
];
