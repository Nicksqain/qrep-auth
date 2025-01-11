import { siteAPI } from "..";

export const sendOTP = async (
  siteURL: string,
  contact: string,
  resend?: boolean,
  messenger?: string
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("contact", contact);
  messenger && queryParams.append("messenger", messenger);
  resend && queryParams.append("resend", resend.valueOf().toString());
  const url = `${siteURL}/send-otp?${queryParams.toString()}`;
  const response = await siteAPI.get(url);
  return response.data;
};

export const verifyOTP = async (
  siteURL: string,
  contact: string,
  otp_code: string
) => {
  const queryParams = new URLSearchParams({
    contact,
    otp_code,
  });
  const url = `${siteURL}/verify-otp?${queryParams.toString()}`;
  const response = await siteAPI.get(url);
  return response.data;
};
