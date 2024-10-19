import { siteAPI } from "..";

export const sendOTP = async (
  contact: string,
  resend?: boolean,
  messenger?: string
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("contact", contact);
  messenger && queryParams.append("messenger", messenger);
  resend && queryParams.append("resend", resend.valueOf().toString());
  const url = `/send-otp?${queryParams.toString()}`;
  const response = await siteAPI.get(url);
  return response.data;
};

export const verifyOTP = async (contact: string, otp_code: string) => {
  const queryParams = new URLSearchParams({
    contact,
    otp_code,
  });
  const url = `/verify-otp?${queryParams.toString()}`;
  const response = await siteAPI.get(url);
  return response.data;
};
