// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** Check if subscription is active GET /api/v1/subscriptions/check */
export async function subscriptionControllerCheckSubscription(options?: {
  [key: string]: any;
}) {
  return request<API.CheckSubscribeDtoResponseDto>(
    "/api/v1/subscriptions/check",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** Get current subscription status GET /api/v1/subscriptions/me */
export async function subscriptionControllerGetMySubscription(options?: {
  [key: string]: any;
}) {
  return request<API.InformationSubscribeDtoResponseDto>(
    "/api/v1/subscriptions/me",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
