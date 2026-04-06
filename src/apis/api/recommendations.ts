// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** Get recommendations for a user GET /recommendations */
export async function recommendationsControllerGet(options?: {
  [key: string]: any;
}) {
  return request<API.RecommendationDtoPaginatedResponseDto>(
    "/recommendations",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}
