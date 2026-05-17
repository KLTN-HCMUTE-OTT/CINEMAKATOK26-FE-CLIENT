import { io, Socket } from "socket.io-client";
import { env } from "@/env";
import { axiosInstance } from "@/lib/request";

let socket: Socket | null = null;
let currentUserId: string | null = null;

function getAccessToken(): string | null {
  try {
    const raw = sessionStorage.getItem("cinemakatok-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function getWatchPartySocket(userId: string): Socket {
  if (socket && socket.connected && currentUserId === userId) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = (axiosInstance.defaults.headers.common?.["Authorization"] as string | undefined)?.replace("Bearer ", "") ?? getAccessToken();

  socket = io(`${env.NEXT_PUBLIC_WS_URL}/watch-party`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  currentUserId = userId;

  socket.on("connect_error", async (err) => {
    if ((err as any)?.message === "UNAUTHORIZED" || (err as any)?.data?.code === "UNAUTHORIZED") {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
        if (res.ok) {
          const body = await res.json() as { accessToken?: string };
          if (body.accessToken && socket) {
            socket.auth = { token: body.accessToken };
            socket.connect();
          }
        }
      } catch {}
    }
  });

  return socket;
}

export function disconnectWatchPartySocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
}
