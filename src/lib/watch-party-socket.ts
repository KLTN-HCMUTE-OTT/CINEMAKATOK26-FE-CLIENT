import { io, Socket } from "socket.io-client";
import { env } from "@/env";
import { getAccessTokenInMemory, setAccessTokenInMemory } from "@/lib/request";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export function getWatchPartySocket(userId: string): Socket {
  if (socket && socket.connected && currentUserId === userId) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = getAccessTokenInMemory();

  socket = io(`${env.NEXT_PUBLIC_WS_URL}/watch-party`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    // On a fresh reload the persisted session restores `user` synchronously,
    // but the in-memory access token is hydrated asynchronously — so it may be
    // null here. Don't auto-connect with a null token (the server would reject
    // the handshake with "Missing token"); refresh first, then connect below.
    autoConnect: Boolean(token),
  });

  currentUserId = userId;

  if (!token) {
    void (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok && socket) {
          const body = (await res.json()) as { accessToken?: string };
          if (body.accessToken) {
            setAccessTokenInMemory(body.accessToken);
            socket.auth = { token: body.accessToken };
          }
        }
      } catch {
        // Fall through and connect anyway so the connect_error recovery runs.
      } finally {
        socket?.connect();
      }
    })();
  }

  socket.on("connect_error", async (err) => {
    let isUnauthorized = false;
    try {
      // NestJS WsException serializes payload as JSON in err.message
      const parsed = JSON.parse(err.message) as { code?: string };
      isUnauthorized = parsed?.code === "UNAUTHORIZED";
    } catch {
      isUnauthorized =
        err.message === "UNAUTHORIZED" ||
        (err as any)?.data?.code === "UNAUTHORIZED";
    }

    if (isUnauthorized) {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
        if (res.ok) {
          const body = await res.json() as { accessToken?: string };
          if (body.accessToken && socket) {
            setAccessTokenInMemory(body.accessToken);
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
