export type AuthPayloadDto = {
  phone?: string;
  email?:string;
  code?:string;
  orgCode?:string
};

export interface VerifyOtpPayloadDto extends AuthPayloadDto {
  otp: string;
}

export interface AuthState {
  login: (payload: AuthPayloadDto) => Promise<void>;
  codelogin: (payload: AuthPayloadDto) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayloadDto) => Promise<void>;
  verifyNumberOtp: (payload: VerifyOtpPayloadDto) => Promise<void>;
  deactivateAccount: () => Promise<void>;
}
