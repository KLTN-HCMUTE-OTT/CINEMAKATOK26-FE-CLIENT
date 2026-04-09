// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** Payment gateway webhook callback (no auth required) POST /api/v1/payments/callback */
export async function paymentControllerPaymentCallback(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/payments/callback", {
    method: "POST",
    ...(options || {}),
  });
}

/** Initiate a payment for an order POST /api/v1/payments/init */
export async function paymentControllerInitPayment(options?: {
  [key: string]: any;
}) {
  return request<any>("/api/v1/payments/init", {
    method: "POST",
    ...(options || {}),
  });
}
