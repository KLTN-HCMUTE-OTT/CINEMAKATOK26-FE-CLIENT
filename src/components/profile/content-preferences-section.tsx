"use client";

/**
 * ContentPreferencesSection
 *
 * Profile tab that lets the user configure their default content censorship
 * sensitivity for violence and nudity. Settings are persisted via Zustand
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
  CheckCircle2,
  RotateCcw,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useContentPreferencesStore } from "@/store/content-preferences.store";
import { CensorSensitivity } from "@/types/censorship.types";

// ── Sensitivity level configuration ────────────────────────────────────────

interface SensitivityLevel {
  value: CensorSensitivity;
  label: string;
  description: string;
  badgeClass: string;
  cardClass: string;
  activeCardClass: string;
}

const DEFAULT_CARD_CLASS =
  "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20";

const VIOLENCE_LEVELS: SensitivityLevel[] = [
  {
    value: "off",
    label: "No filtering",
    description: "Watch the original cut. A small indicator appears when a violent scene starts.",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    cardClass: DEFAULT_CARD_CLASS,
    activeCardClass: "border-zinc-500 bg-zinc-800/60",
  },
  {
    value: "moderate",
    label: "Blur sensitive areas",
    description: "Automatically blurs weapons, blood, and impacts while the rest of the scene stays visible.",
    badgeClass: "bg-orange-950/50 text-orange-300 border-orange-700/30",
    cardClass: DEFAULT_CARD_CLASS,
    activeCardClass: "border-orange-500 bg-orange-500/10",
  },
  {
    value: "strict",
    label: "Blur entire screen",
    description: "Blurs the full frame during violent scenes. Best for shared or family viewing.",
    badgeClass: "bg-red-950/50 text-red-300 border-red-700/30",
    cardClass: DEFAULT_CARD_CLASS,
    activeCardClass: "border-red-500 bg-red-500/10",
  },
];

const NUDITY_LEVELS: SensitivityLevel[] = [
  {
    value: "off",
    label: "No filtering",
    description: "Watch unfiltered. A small indicator appears before mature scenes.",
    badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    cardClass: DEFAULT_CARD_CLASS,
    activeCardClass: "border-zinc-500 bg-zinc-800/60",
  },
  {
    value: "moderate",
    label: "Blur sensitive areas",
    description: "Blurs explicit regions while keeping faces and background visible.",
    badgeClass: "bg-pink-950/50 text-pink-300 border-pink-700/30",
    cardClass: DEFAULT_CARD_CLASS,
    activeCardClass: "border-pink-500 bg-pink-500/10",
  },
  {
    value: "strict",
    label: "Blur entire screen",
    description: "Blurs the full frame during explicit or mature scenes.",
    badgeClass: "bg-violet-950/50 text-violet-300 border-violet-700/30",
    cardClass: DEFAULT_CARD_CLASS,
    activeCardClass: "border-violet-500 bg-violet-500/10",
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
      className={`relative w-full text-left p-4 rounded-xl border transition-colors duration-150 cursor-pointer ${
        isActive ? level.activeCardClass : level.cardClass
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-white">
              {level.label}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 font-bold tracking-wider uppercase border ${level.badgeClass}`}
            >
              {level.value === "off" ? "Off" : level.value}
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
  levels,
  currentValue,
  onSelect,
}: {
  title: string;
  levels: SensitivityLevel[];
  currentValue: CensorSensitivity;
  onSelect: (v: CensorSensitivity) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
        {title}
      </h3>
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
      toast.success("Content filters saved", {
        description: "These settings will apply the next time you start a video.",
        icon: <Shield className="w-4 h-4 text-violet-400" />,
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
      toast.info("Filters reset to off.");
    } catch (error) {
      toast.error("Failed to reset preferences on server.");
    }
  };

  const getFriendlyLabel = (value: CensorSensitivity) => {
    if (value === "strict") return "Blur entire screen";
    if (value === "moderate") return "Blur sensitive areas";
    return "No filtering";
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
            <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">
                Content Filters
              </CardTitle>
              <p className="text-gray-400 text-sm mt-0.5">
                Choose how violent and explicit scenes are handled by default. You can still adjust this per session from the player controls.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              These settings apply automatically every time you start a video. Filtering only works on titles that have been processed for scene metadata.
            </p>
          </div>

          {/* Violence settings */}
          <CategorySection
            title="Violence & Gore"
            levels={VIOLENCE_LEVELS}
            currentValue={tempViolence}
            onSelect={setTempViolence}
          />

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Nudity settings */}
          <CategorySection
            title="Nudity & Mature Scenes"
            levels={NUDITY_LEVELS}
            currentValue={tempNudity}
            onSelect={setTempNudity}
          />

          {/* Current summary pill */}
          <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-gray-400 w-full mb-1 font-medium uppercase tracking-wide">
              Current settings
            </span>
            <div className="flex items-center gap-2 text-sm text-white">
              <span className="text-gray-400">Violence filter:</span>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  tempViolence === "strict"
                    ? "border-red-500/50 text-red-300 bg-red-900/20"
                    : tempViolence === "moderate"
                    ? "border-orange-500/50 text-orange-300 bg-orange-950/20"
                    : "border-zinc-500/50 text-zinc-300 bg-zinc-800/40"
                }`}
              >
                {getFriendlyLabel(tempViolence)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <span className="text-gray-400">Nudity filter:</span>
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  tempNudity === "strict"
                    ? "border-violet-500/50 text-violet-300 bg-violet-950/20"
                    : tempNudity === "moderate"
                    ? "border-pink-500/50 text-pink-300 bg-pink-950/20"
                    : "border-zinc-500/50 text-zinc-300 bg-zinc-800/40"
                }`}
              >
                {getFriendlyLabel(tempNudity)}
              </Badge>
            </div>
            {(tempViolence !== preferences.violence || tempNudity !== preferences.nudity) && (
              <span className="text-xs text-amber-400 ml-auto flex items-center gap-1">
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
              className={`flex-1 font-semibold transition-colors ${
                saved
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
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
                  Settings saved
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Save filters
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
              Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it works card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            How filtering works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-2">
              <div className="font-semibold text-zinc-200">
                No filtering
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Stream the original footage. A small overlay alert appears at the edge of the player when mature content is active.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-700/30 space-y-2">
              <div className="font-semibold text-orange-200">
                Blur sensitive areas
              </div>
              <p className="text-xs text-orange-300/70 leading-relaxed">
                Blurring is calculated over the specific regions involved — weapon grips, blood spatter, or explicit skin areas — while the rest of the frame stays clear.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-700/30 space-y-2">
              <div className="font-semibold text-red-200">
                Blur entire screen
              </div>
              <p className="text-xs text-red-300/70 leading-relaxed">
                The full frame is blurred during any detected sequence. Useful for shared living rooms or watching with children present.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Detection runs through our visual-recognition pipeline. Settings are saved to your account and apply across web, smart TV, and watch party sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}