import { env } from "@/env";

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
}

export function backendAuthUrl(path: string): string {
  // NEXT_PUBLIC_API_URL in this project points at API base, often ending with /api/v1.
  return joinUrl(env.NEXT_PUBLIC_API_URL, path);
}

export function cookieConfig(maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function readJsonBody<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}

export async function parseBackendError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}
