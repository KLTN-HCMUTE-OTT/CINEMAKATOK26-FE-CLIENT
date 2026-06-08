import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendAuthUrl, cookieConfig, parseBackendError } from "../_utils";

async function refreshTokens() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return { error: "Missing refresh token", status: 401 } as const;
  }

  const backendRes = await fetch(backendAuthUrl("/api/v1/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!backendRes.ok) {
    const message = await parseBackendError(backendRes, "Token refresh failed");
    return { error: message, status: backendRes.status } as const;
  }

  const backendData = (await backendRes.json()) as {
    data?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };

  const newAccessToken = backendData.data?.accessToken;
  const newRefreshToken = backendData.data?.refreshToken;

  if (!newAccessToken) {
    return { error: "Invalid refresh payload", status: 502 } as const;
  }

  cookieStore.set("accessToken", newAccessToken, cookieConfig(60 * 60));
  if (newRefreshToken) {
    cookieStore.set(
      "refreshToken",
      newRefreshToken,
      cookieConfig(7 * 24 * 60 * 60),
    );
  }

  return { accessToken: newAccessToken } as const;
}

export async function POST() {
  const refreshed = await refreshTokens();
  if ("error" in refreshed) {
    return NextResponse.json(
      { message: refreshed.error },
      { status: refreshed.status },
    );
  }

  return NextResponse.json(
    { accessToken: refreshed.accessToken },
    { status: 200 },
  );
}

export async function GET(req: Request) {
  const refreshed = await refreshTokens();
  const reqUrl = new URL(req.url);
  const redirectPath = reqUrl.searchParams.get("redirect") || "/";

  if ("error" in refreshed) {
    const fallback = new URL("/", req.url);
    fallback.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(fallback);
  }

  const redirectUrl = new URL(redirectPath, req.url);
  return NextResponse.redirect(redirectUrl);
}
