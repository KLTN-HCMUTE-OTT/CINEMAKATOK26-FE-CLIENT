// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** Issue ClearKey DRM license Validate user entitlement and return ClearKey JWKS response POST /api/v1/drm/license/clearkey */
export async function drmControllerIssueClearKeyLicense(
  body: API.ClearKeyLicenseRequestDto,
  options?: { [key: string]: any }
) {
  return request<API.ClearKeyLicenseResponseDto>(
    "/api/v1/drm/license/clearkey",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
