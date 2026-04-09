/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "@/env";

let accessTokenInMemory: string | null = null;
type RequestConfig = AxiosRequestConfig & { [key: string]: any };

const instance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    if (accessTokenInMemory) {
      config.headers.Authorization = `Bearer ${accessTokenInMemory}`;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("API Request", {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (
        typeof originalRequest.url === "string" &&
        originalRequest.url.includes("/api/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post<{ accessToken: string }>(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        accessTokenInMemory = refreshRes.data.accessToken;

        if (accessTokenInMemory) {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessTokenInMemory}`,
          };
        }

        return instance(originalRequest);
      } catch (refreshError) {
        accessTokenInMemory = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default function request<T = any>(
  url: string | RequestConfig,
  config?: RequestConfig,
): Promise<AxiosResponse<T>> {
  if (typeof url === "string") {
    return instance.request<T>({ url, ...config });
  }

  return instance.request<T>(url as AxiosRequestConfig);
}

export { instance as axiosInstance };

export function setAccessTokenInMemory(token: string | null) {
  accessTokenInMemory = token;
}
