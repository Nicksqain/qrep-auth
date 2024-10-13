import axios from "axios";

export const siteAPI = axios.create({
  baseURL: `${import.meta.env.VITE_APP_SITE_URL}`,
});