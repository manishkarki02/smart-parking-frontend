import axios from "axios";
// import { useAuthStore } from "@/store/auth-store";

const API_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
// api.interceptors.request.use(
//   (config) => {
    // const token = useAuthStore.getState().accessToken;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    // return config;
//   },
//   (error) => Promise.reject(error)
// );

// Response Interceptor: Handle 401 & Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

    //   try {
    //     const refreshToken = useAuthStore.getState().refreshToken;
    //     if (!refreshToken) {
    //       useAuthStore.getState().logout();
    //       // window.location.href = "/signin"; // Optional: Force redirect
    //       return Promise.reject(error);
    //     }

    //     const response = await axios.post(`${API_URL}/auth/refresh`, {
    //       refreshToken,
    //     });

    //     const { accessToken, refreshToken: newRefreshToken } =
    //       response.data.data;

    //     useAuthStore.getState().setTokens(accessToken, newRefreshToken);

    //     // Update header and retry original request
    //     originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    //     return api(originalRequest);
    //   } catch (refreshError) {
    //     useAuthStore.getState().logout();
    //     // window.location.href = "/signin"; // Optional: Force redirect
    //     return Promise.reject(refreshError);
    //   }
    }
    return Promise.reject(error);
  }
);