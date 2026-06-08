// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** Aggregate health check for all microservices GET /api/v1/health */
export async function healthControllerGetAggregatedHealth(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/health", {
    method: "GET",
    ...(options || {}),
  });
}

/** Payment service health check GET /api/v1/health/payment */
export async function healthControllerGetPaymentHealth(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/health/payment", {
    method: "GET",
    ...(options || {}),
  });
}
