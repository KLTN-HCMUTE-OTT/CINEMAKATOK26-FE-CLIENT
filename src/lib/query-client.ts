"use client";

import { QueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 404 or 403 — no point retrying "not found" or "forbidden"
          const status = (error as any)?.response?.status;
          if (status === 404 || status === 403) return false;
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
      },
      mutations: {
        onError: (error) => {
          const status = (error as any)?.response?.status;
          if (status === 401) {
            // Open login modal when a mutation returns 401
            useUIStore.getState().openLoginModal();
          }
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: reuse the same query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
