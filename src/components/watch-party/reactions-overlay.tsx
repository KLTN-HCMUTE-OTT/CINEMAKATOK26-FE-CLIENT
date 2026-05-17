"use client";

import { useRef, useCallback } from "react";
import type { Reaction } from "@/types/watch-party";

const EMOJI_SET = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
const THROTTLE_MS = 200;

interface ReactionsOverlayProps {
  reactions: Reaction[];
  onRemove: (id: string) => void;
  onSend: (emoji: string) => void;
  userId: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export function ReactionsOverlay({
  reactions,
  onRemove,
  onSend,
  userId,
}: ReactionsOverlayProps) {
  const lastSendRef = useRef<Record<string, number>>({});

  const handleSend = useCallback((emoji: string) => {
    const now = Date.now();
    if (now - (lastSendRef.current[emoji] ?? 0) < THROTTLE_MS) return;
    lastSendRef.current[emoji] = now;
    onSend(emoji);
  }, [onSend]);

  return (
    <>
      {/* Floating reactions layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {reactions.map((r) => (
          <FloatingEmoji
            key={r.id}
            reaction={r}
            onDone={() => onRemove(r.id)}
          />
        ))}
      </div>

      {/* Emoji bar — bottom-left of video */}
      <div className="absolute bottom-16 left-4 z-20">
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1.5">
          {EMOJI_SET.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSend(emoji)}
              className="text-lg hover:scale-125 transition-transform active:scale-110 leading-none"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function FloatingEmoji({
  reaction,
  onDone,
}: {
  reaction: Reaction;
  onDone: () => void;
}) {
  const x = ((reaction.id.charCodeAt(0) * 137 + reaction.id.charCodeAt(1) * 31) % 60) + 20;

  return (
    <span
      key={reaction.id}
      onAnimationEnd={onDone}
      className="absolute text-2xl pointer-events-none select-none"
      style={{
        left: `${x}%`,
        bottom: "15%",
        animation: "floatUp 3s ease-out forwards",
      }}
    >
      {reaction.emoji}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          60%  { transform: translateY(-120px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-200px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </span>
  );
}
