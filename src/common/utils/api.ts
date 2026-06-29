import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/common/types/api.types";
import type { AuthResponse } from "@/features/auth/types/auth.types";
import { API_BASE, AUTH_ROUTES } from "@/config/api-routes";

axios.defaults.headers.post["Content-Type"] = "application/json";
const API_URL = "/api";
const refreshUrl = `${API_URL}${API_BASE.AUTH}${AUTH_ROUTES.REFRESH}`;

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

function isUnauthorizedError(
  error: AxiosError<{
    code?: string | number;
    responseCode?: string | number;
    message?: string;
    error?: string;
  }>,
): boolean {
  const status = error.response?.status;
  const code = error.response?.data?.code ?? error.response?.data?.responseCode;
  return status === 401 || Number(code) === 401;
}

function isRefreshRequest(config?: InternalAxiosRequestConfig): boolean {
  return config?.url?.includes(AUTH_ROUTES.REFRESH) ?? false;
}

function resolveRefreshQueue(error: AxiosError | null, token?: string) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error ?? new AxiosError("Unable to refresh session"));
      return;
    }
    resolve(token);
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const response = await axios.post<ApiResponse<AuthResponse>>(
    refreshUrl,
    undefined,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = response.data.data;
  useAuthStore.getState().setAuth(data.accessToken, {
    id: data.userId,
    name: data.name,
    email: data.email,
    role: data.role,
    banned: data.banned,
    approved: data.approved,
  });
  return data.accessToken;
}

function redirectToLogin() {
  useAuthStore.getState().logout();
  window.location.href = "/login";
}

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
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (
      error: AxiosError<{
        code?: string | number;
        responseCode?: string | number;
        message?: string;
        error?: string;
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

      const originalRequest = error.config as RetryRequestConfig | undefined;
      if (
        originalRequest &&
        isUnauthorizedError(error) &&
        !originalRequest._retry &&
        !isRefreshRequest(originalRequest)
      ) {
        originalRequest._retry = true;

        if (isRefreshing) {
          const token = await new Promise<string>((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }

        isRefreshing = true;

        try {
          const token = await refreshAccessToken();
          resolveRefreshQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          const refreshAxiosError =
            refreshError instanceof AxiosError
              ? refreshError
              : new AxiosError("Unable to refresh session");
          resolveRefreshQueue(refreshAxiosError);
          redirectToLogin();
          throw refreshAxiosError;
        } finally {
          isRefreshing = false;
        }
      }

      // if (import.meta.env.VITE_NODE_ENV === "development") {
      // }
      throw error;
    },
  );

  return api;
};

export default createApi;
