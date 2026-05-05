import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";

axios.defaults.headers.post["Content-Type"] = "application/json";
const API_URL = "/api";

const createApi = (path: string) => {
  const api = axios.create({
    baseURL: `${API_URL}${path}`,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    return config;
  });

  api.interceptors.response.use(
    null,
    (
      error: AxiosError<{
        code: string | number;
        message: string;
        error: string;
      }>,
    ) => {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new AxiosError("Server is unreachable");
      }
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        throw new AxiosError("Request timeout");
      }
      if (Number(error.response?.status) >= 500) {
        throw new AxiosError(
          error.response?.data?.message || "Something went wrong",
        );
      }
      if (
        Number(error.response?.data?.code) === 401 &&
        error.response?.data?.message === "Unauthorized"
      ) {
        useAuthStore.getState().logout();
        document.location.href = "/";
      }

      // if (import.meta.env.VITE_NODE_ENV === "development") {
      // }
      throw error;
    },
  );

  return api;
};

export default createApi;
