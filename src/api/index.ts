import axios from "axios";

export const siteAPI = axios.create({
  baseURL: `${import.meta.env.VITE_APP_SITE_URL}`,
});

siteAPI.interceptors.request.use(
  (config) => {
    config.headers["Accept-Language"] =
      localStorage.getItem("language") || "kz";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);