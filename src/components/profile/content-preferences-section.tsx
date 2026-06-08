"use client";

/**
 * ContentPreferencesSection
 *
 * Profile tab that lets the user configure their default content censorship
 * sensitivity for violence and nudity.  Settings are persisted via Zustand
 * (localStorage) and applied as `initialPreferences` to every video player
 * session.
 *
 * Sensitivity levels:
 *  - off      → No filtering; warning badge shown inside the player
 *  - moderate → Blur only detected bounding-box regions
 *  - strict   → Blur the entire screen during detected scenes
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldOff,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Swords,
  RotateCcw,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useContentPreferencesStore } from "@/store/content-preferences.store";
import { CensorSensitivity } from "@/types/censorship.types";

// ── Sensitivity level configuration ────────────────────────────────────────

interface SensitivityLevel {
  value: CensorSensitivity;
  label: string;
  description: string;
  icon: React.ReactNode;
  badgeClass: string;
  cardClass: string;
  activeCardClass: string;
}

const VIOLENCE_LEVELS: SensitivityLevel[] = [
  {
    value: "off",
    label: "Off",
    description: "Play normally. A small badge alerts you when violent content is detected.",
    icon: <ShieldOff className="w-5 h-5" />,
    badgeClass: "bg-zinc-700/60 text-zinc-300 border-zinc-600",
    cardClass:
      "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
    activeCardClass: "border-zinc-400/50 bg-zinc-700/30 ring-1 ring-zinc-400/30",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Blurs only detected regions (weapons, fists, blood). Rest of the scene remains visible.",
    icon: <Shield className="w-5 h-5" />,
    badgeClass: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    cardClass:
      "border-white/10 bg-white/5 hover:bg-amber-900/10 hover:border-amber-700/30",
    activeCardClass: "border-amber-500/50 bg-amber-900/20 ring-1 ring-amber-500/30",
  },
  {
    value: "strict",
    label: "Strict",
    description: "Blurs the entire screen during violent sequences. Strongest protection.",
    icon: <ShieldAlert className="w-5 h-5" />,
    badgeClass: "bg-red-900/50 text-red-300 border-red-700/50",
    cardClass:
      "border-white/10 bg-white/5 hover:bg-red-900/10 hover:border-red-700/30",
    activeCardClass: "border-red-500/50 bg-red-900/20 ring-1 ring-red-500/30",
  },
];

const NUDITY_LEVELS: SensitivityLevel[] = [
  {
    value: "off",
    label: "Off",
    description: "Play normally. A small badge alerts you when nudity is detected.",
    icon: <Eye className="w-5 h-5" />,
    badgeClass: "bg-zinc-700/60 text-zinc-300 border-zinc-600",
    cardClass:
      "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
    activeCardClass: "border-zinc-400/50 bg-zinc-700/30 ring-1 ring-zinc-400/30",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Blurs only detected skin regions. Faces and context remain visible.",
    icon: <EyeOff className="w-5 h-5" />,
    badgeClass: "bg-pink-900/50 text-pink-300 border-pink-700/50",
    cardClass:
      "border-white/10 bg-white/5 hover:bg-pink-900/10 hover:border-pink-700/30",
    activeCardClass: "border-pink-500/50 bg-pink-900/20 ring-1 ring-pink-500/30",
  },
  {
    value: "strict",
    label: "Strict",
    description: "Blurs the entire screen during detected nudity. Strongest protection.",
    icon: <ShieldCheck className="w-5 h-5" />,
    badgeClass: "bg-purple-900/50 text-purple-300 border-purple-700/50",
    cardClass:
      "border-white/10 bg-white/5 hover:bg-purple-900/10 hover:border-purple-700/30",
    activeCardClass: "border-purple-500/50 bg-purple-900/20 ring-1 ring-purple-500/30",
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function SensitivityCard({
  level,
  isActive,
  onSelect,
}: {
  level: SensitivityLevel;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive ? level.activeCardClass : level.cardClass
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 p-2 rounded-lg ${
            isActive ? "bg-white/15" : "bg-white/5"
          }`}
        >
          {level.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">
              {level.label}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 font-medium border ${level.badgeClass}`}
            >
              {level.value}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            {level.description}
          </p>
        </div>
        {isActive && (
          <CheckCircle2 className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
}

function CategorySection({
  title,
  icon,
  levels,
  currentValue,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  levels: SensitivityLevel[];
  currentValue: CensorSensitivity;
  onSelect: (v: CensorSensitivity) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {levels.map((level) => (
          <SensitivityCard
            key={level.value}
            level={level}
            isActive={currentValue === level.value}
            onSelect={() => onSelect(level.value)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function ContentPreferencesSection() {
  const { preferences, fetchPreferences, updatePreferencesOnServer, isSyncing } =
    useContentPreferencesStore();

  const [tempViolence, setTempViolence] = useState<CensorSensitivity>(preferences.violence);
  const [tempNudity, setTempNudity] = useState<CensorSensitivity>(preferences.nudity);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Sync component state when store values are loaded/updated from the server
  useEffect(() => {
    setTempViolence(preferences.violence);
    setTempNudity(preferences.nudity);
  }, [preferences]);

  // Load preferences from server on mount
  useEffect(() => {
    const load = async () => {
      try {
        await fetchPreferences();
      } catch (error) {
        console.error("Failed to load preferences from server", error);
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [fetchPreferences]);

  const handleSave = async () => {
    try {
      await updatePreferencesOnServer({
        violence: tempViolence,
        nudity: tempNudity,
      });
      setSaved(true);
      toast.success("Content preferences saved!", {
        description: "Your settings will apply to all future video sessions.",
        icon: <Shield className="w-4 h-4 text-orange-400" />,
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to save content preferences.", {
        description: "An error occurred while communicating with the server.",
      });
    }
  };

  const handleReset = async () => {
    try {
      const defaultPrefs = { violence: "off", nudity: "off" } as const;
      await updatePreferencesOnServer(defaultPrefs);
      setTempViolence("off");
      setTempNudity("off");
      toast.info("Preferences reset to defaults.");
    } catch (error) {
      toast.error("Failed to reset preferences on server.");
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="space-y-2">
                <div className="w-32 h-5 bg-white/10 rounded" />
                <div className="w-64 h-4 bg-white/10 rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="h-16 bg-white/5 rounded-xl" />
            <div className="space-y-3">
              <div className="w-24 h-4 bg-white/10 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-24 h-4 bg-white/10 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/25">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">
                Content Filters
              </CardTitle>
              <p className="text-gray-400 text-sm mt-0.5">
                Set your default sensitivity for violence and nudity in all videos.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/90 leading-relaxed">
              These settings are applied automatically when you start watching a video.
              You can also override them per-session using the{" "}
              <span className="font-semibold text-blue-300">
                Shield (
                <Shield className="inline w-3 h-3 mb-0.5" />) button
              </span>{" "}
              inside the video player. Only videos with AI-detected content have
              active filters.
            </p>
          </div>

          {/* Violence settings */}
          <CategorySection
            title="Violence"
            icon={<Swords className="w-4 h-4 text-red-400" />}
            levels={VIOLENCE_LEVELS}
            currentValue={tempViolence}
            onSelect={setTempViolence}
          />

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Nudity settings */}
          <CategorySection
            title="Nudity & Sexual Content"
            icon={<EyeOff className="w-4 h-4 text-pink-400" />}
            levels={NUDITY_LEVELS}
            currentValue={tempNudity}
            onSelect={setTempNudity}
          />

          {/* Current summary pill */}
          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-gray-400 w-full mb-1 font-medium uppercase tracking-wide">
              Selected Settings
            </span>
            <div className="flex items-center gap-2 text-sm text-white">
              <Swords className="w-3.5 h-3.5 text-red-400" />
              <span className="text-gray-400">Violence:</span>
              <Badge
                variant="outline"
                className={`capitalize text-xs ${
                  tempViolence === "strict"
                    ? "border-red-500/50 text-red-300 bg-red-900/20"
                    : tempViolence === "moderate"
                    ? "border-amber-500/50 text-amber-300 bg-amber-900/20"
                    : "border-zinc-500/50 text-zinc-300 bg-zinc-800/40"
                }`}
              >
                {tempViolence}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <EyeOff className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-gray-400">Nudity:</span>
              <Badge
                variant="outline"
                className={`capitalize text-xs ${
                  tempNudity === "strict"
                    ? "border-purple-500/50 text-purple-300 bg-purple-900/20"
                    : tempNudity === "moderate"
                    ? "border-pink-500/50 text-pink-300 bg-pink-900/20"
                    : "border-zinc-500/50 text-zinc-300 bg-zinc-800/40"
                }`}
              >
                {tempNudity}
              </Badge>
            </div>
            {(tempViolence !== preferences.violence || tempNudity !== preferences.nudity) && (
              <span className="text-xs text-orange-400 ml-auto flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Unsaved changes
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSyncing}
              className={`flex-1 font-semibold transition-all ${
                saved
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
              }`}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isSyncing}
              variant="outline"
              className="sm:w-auto border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            How Content Filters Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-200">
                <ShieldOff className="w-4 h-4 text-zinc-400" />
                Off
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Video plays normally. A small indicator badge appears when
                AI-detected content is present in the current scene.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-200">
                <Shield className="w-4 h-4 text-amber-400" />
                Moderate
              </div>
              <p className="text-xs text-amber-300/70 leading-relaxed">
                Only the specific regions detected by AI (e.g. a weapon, exposed
                skin) are blurred using a targeted bounding-box overlay.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-900/20 border border-red-700/30 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-red-200">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Strict
              </div>
              <p className="text-xs text-red-300/70 leading-relaxed">
                The entire video frame is blurred for the duration of any
                detected scene. Best for shared or family viewing environments.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Content detection is powered by our AI analysis pipeline. Filters
            apply only to videos that have been processed and contain detection
            data. Accuracy may vary.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
