"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Film,
  Type,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ShieldOff,
  Loader2,
  Sparkles,
  Search,
  X,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateRoom } from "@/hooks/use-watch-party";
import { ContentPickerDialog } from "./content-picker";
import { saveRoomContentRef } from "@/lib/watch-party-content-cache";
import type { ContentRef } from "@/types/content-ref";

const schema = z.object({
  title: z
    .string()
    .min(1, "Room title is required")
    .max(120, "Max 120 characters"),
  password: z
    .string()
    .optional()
    .refine(
      (v) => !v || (v.length >= 4 && v.length <= 64),
      "Password must be 4–64 characters"
    ),
  isPublic: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export function CreateRoomForm() {
  const router = useRouter();
  const { mutateAsync: createRoom, isPending } = useCreateRoom();
  const [showPassword, setShowPassword] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contentRef, setContentRef] = useState<ContentRef | null>(null);
  const [contentError, setContentError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isPublic: true },
  });

  const isPublic = watch("isPublic");

  const handleContentConfirm = (ref: ContentRef) => {
    setContentRef(ref);
    setContentError(false);
    // Auto-fill title if user hasn't typed one yet
    const currentTitle = watch("title");
    if (!currentTitle || currentTitle.trim() === "") {
      setValue("title", ref.title, { shouldValidate: true });
    }
  };

  const clearContent = () => setContentRef(null);

  const onSubmit = async (data: FormValues) => {
    if (!contentRef) {
      setContentError(true);
      return;
    }

    try {
      const result = await createRoom({
        videoId: contentRef.videoId,
        title: data.title,
        password: data.password || undefined,
        isPublic: data.isPublic,
      });

      if (result?.roomId) {
        saveRoomContentRef(result.roomId, contentRef);
        router.replace(`/watch-party/${result.roomId}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Failed to create room. Try again.";
      toast.error(msg);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Content selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Film className="w-4 h-4 text-purple-400" />
            Content
          </label>

          {contentRef ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-purple-500/40">
              <div className="relative flex-none w-10 h-14 rounded overflow-hidden bg-gray-800">
                {contentRef.posterUrl && (
                  <Image
                    src={contentRef.posterUrl}
                    alt={contentRef.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {contentRef.title}
                </p>
                <span
                  className={`inline-block text-xs px-1.5 py-0.5 rounded mt-1 font-medium ${
                    contentRef.type === "movie"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-purple-500/15 text-purple-400"
                  }`}
                >
                  {contentRef.type === "movie" ? (
                    <span className="flex items-center gap-1">
                      <Film className="w-3 h-3" /> Movie
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Tv className="w-3 h-3" /> Episode
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={clearContent}
                className="flex-none text-gray-500 hover:text-white transition-colors"
                title="Change content"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setContentError(false);
                setPickerOpen(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-sm ${
                contentError
                  ? "bg-red-500/5 border-red-500/40 text-red-400"
                  : "bg-white/5 border-white/10 text-gray-500 hover:border-purple-500/40 hover:text-gray-300"
              }`}
            >
              <Search className="w-4 h-4" />
              {contentError
                ? "Please select content first"
                : "Select a movie or episode…"}
            </button>
          )}

          {contentError && !contentRef && (
            <p className="text-xs text-red-400 mt-1">
              Content selection is required
            </p>
          )}

          {contentRef && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs text-purple-400 hover:text-purple-300 mt-1.5 transition-colors"
            >
              Change content
            </button>
          )}
        </div>

        {/* Room title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Type className="w-4 h-4 text-purple-400" />
            Room title
          </label>
          <input
            {...register("title")}
            placeholder="e.g. Friday Night Movie Club"
            maxLength={120}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Password (optional) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Password
            <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Leave blank for no password"
              className="w-full px-4 py-3 pr-11 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Visibility toggle */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
            isPublic
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-white/5 border-white/10 hover:border-white/20"
          }`}
          onClick={() => setValue("isPublic", !isPublic)}
        >
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="w-5 h-5 text-blue-400" />
            ) : (
              <ShieldOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {isPublic ? "Public room" : "Private room"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isPublic
                  ? "Appears in the rooms list — anyone can discover it"
                  : "Hidden from list — only accessible via invite link"}
              </p>
            </div>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition-all relative ${
              isPublic ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                isPublic ? "left-[22px]" : "left-0.5"
              }`}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating room…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create watch party
            </>
          )}
        </Button>
      </form>

      <ContentPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onConfirm={handleContentConfirm}
      />
    </>
  );
}
