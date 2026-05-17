"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MicOff, Send, ArrowDown } from "lucide-react";
import type { ChatMessage } from "@/types/watch-party";

interface LiveChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  isMuted: boolean;
  onSend: (text: string) => void;
}

function hashColor(userId: string) {
  const palette = [
    "#a78bfa", "#60a5fa", "#34d399", "#f472b6",
    "#fb923c", "#38bdf8", "#c084fc", "#4ade80",
  ];
  let h = 0;
  for (const c of userId) h = (h * 31 + c.charCodeAt(0)) | 0;
  return palette[Math.abs(h) % palette.length];
}

function MessageItem({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  const isSystem = msg.userId === "__system__";

  if (isSystem) {
    return (
      <div className="px-3 py-1 text-center">
        <span className="text-[11px] italic text-gray-500">{msg.text}</span>
      </div>
    );
  }

  return (
    <div className={`px-3 py-1.5 flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
      <div className="flex-none flex flex-col items-center gap-1">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-none"
          style={{ backgroundColor: hashColor(msg.userId) + "55", border: `1px solid ${hashColor(msg.userId)}44` }}
        >
          <span style={{ color: hashColor(msg.userId) }}>
            {msg.displayName[0]?.toUpperCase() ?? "?"}
          </span>
        </div>
      </div>
      <div className={`flex-1 min-w-0 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        <span
          className="text-[10px] font-semibold mb-0.5"
          style={{ color: hashColor(msg.userId) }}
        >
          {isMe ? "You" : msg.displayName}
        </span>
        <div
          className={`text-xs text-white/90 leading-relaxed break-words max-w-[85%] px-2.5 py-1.5 rounded-xl ${
            isMe
              ? "bg-purple-600/40 border border-purple-500/30 rounded-tr-sm"
              : "bg-white/6 border border-white/8 rounded-tl-sm"
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export function LiveChat({ messages, currentUserId, isMuted, onSend }: LiveChatProps) {
  const [text, setText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(messages.length);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setNewCount(0);
  }, []);

  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      if (isAtBottom) {
        scrollToBottom();
      } else {
        setNewCount((n) => n + (messages.length - prevLenRef.current));
      }
    }
    prevLenRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsAtBottom(atBottom);
    if (atBottom) setNewCount(0);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isMuted) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-600 text-xs">
            No messages yet. Say hi!
          </div>
        )}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            isMe={msg.userId === currentUserId}
          />
        ))}
      </div>

      {/* New messages badge */}
      {newCount > 0 && !isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="mx-3 mb-1 flex items-center justify-center gap-1.5 text-xs text-purple-400 bg-purple-500/15 border border-purple-500/30 rounded-lg py-1.5 hover:bg-purple-500/25 transition-colors"
        >
          <ArrowDown className="w-3 h-3" />
          {newCount} new message{newCount > 1 ? "s" : ""}
        </button>
      )}

      {/* Input */}
      <div className="flex-none border-t border-white/8 p-2.5">
        {isMuted ? (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-500">
            <MicOff className="w-4 h-4" />
            You are muted
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message…"
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-purple-500/50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="flex-none w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
