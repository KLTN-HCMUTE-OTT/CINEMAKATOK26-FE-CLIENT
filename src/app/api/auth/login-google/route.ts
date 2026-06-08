import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  backendAuthUrl,
  cookieConfig,
  parseBackendError,
  readJsonBody,
} from "../_utils";

interface LoginGoogleBody {
  googleToken: string;
}

export async function POST(req: Request) {
  try {
    const payload = await readJsonBody<LoginGoogleBody>(req);

    const backendRes = await fetch(
      backendAuthUrl("/api/v1/auth/social-login"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          accessToken: payload.googleToken,
        }),
      },
    );

    if (!backendRes.ok) {
      const message = await parseBackendError(
        backendRes,
        "Google login failed",
      );
      return NextResponse.json({ message }, { status: backendRes.status });
    }

    const backendData = (await backendRes.json()) as {
      data?: {
        token?: {
          accessToken?: string;
          refreshToken?: string;
        };
        [key: string]: unknown;
      };
    };

    const accessToken = backendData.data?.token?.accessToken;
    const refreshToken = backendData.data?.token?.refreshToken;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { message: "Invalid token payload from backend" },
        { status: 502 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, cookieConfig(60 * 60));
    cookieStore.set(
      "refreshToken",
      refreshToken,
      cookieConfig(7 * 24 * 60 * 60),
    );

    const user = { ...(backendData.data ?? {}) } as Record<string, unknown>;
    delete user.token;

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
