export interface CountryCodeDto {
  flag: string;
  code: string;
  name: string;
}

export interface CountryApiResDto {
  flags: Flags;
  name: Name;
  idd: Idd;
}
export interface Flags {
  png: string;
  svg: string;
  alt: string;
}
export interface Name {
  common: string;
  official: string;
  nativeName: NativeName;
}
export interface NativeName {
  fra?: FraOrIsl | null;
  isl?: FraOrIsl1 | null;
}
export interface FraOrIsl {
  official: string;
  common: string;
}
export interface FraOrIsl1 {
  official: string;
  common: string;
}
export interface Idd {
  root: string;
  suffixes?: string[] | null;
}
