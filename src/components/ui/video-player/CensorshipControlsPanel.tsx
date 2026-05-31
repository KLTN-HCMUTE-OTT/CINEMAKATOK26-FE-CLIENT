'use client';

/**
 * Phase 4: CensorshipControlsPanel
 *
 * A small in-player settings panel that lets the user choose their
 * censorship sensitivity level for violence and nudity independently.
 *
 * It is rendered as an absolute-positioned floating card inside the
 * video player container, above the blur overlay (z-index 3+).
 */

import React from 'react';
import { Shield, EyeOff, Eye } from 'lucide-react';
import {
  ContentPreferences,
  CensorSensitivity,
} from '@/types/censorship.types';

interface CensorshipControlsPanelProps {
  preferences: ContentPreferences;
  onChange: (next: ContentPreferences) => void;
  hasViolence: boolean;
  hasNudity: boolean;
}

const LEVELS: { value: CensorSensitivity; label: string; description: string }[] = [
  { value: 'off', label: 'Off', description: 'No censorship' },
  { value: 'moderate', label: 'Moderate', description: 'Blur detected regions' },
  { value: 'strict', label: 'Strict', description: 'Blur entire screen' },
];

function CategoryRow({
  label,
  icon,
  current,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  current: CensorSensitivity;
  onChange: (v: CensorSensitivity) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="flex gap-1">
        {LEVELS.map(({ value, label: lvlLabel, description }) => (
          <button
            key={value}
            title={description}
            onClick={() => onChange(value)}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all cursor-pointer ${
              current === value
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
          >
            {lvlLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

export const CensorshipControlsPanel: React.FC<CensorshipControlsPanelProps> = ({
  preferences,
  onChange,
  hasViolence,
  hasNudity,
}) => {
  if (!hasViolence && !hasNudity) return null;

  return (
    <div
      className="absolute top-14 right-4 z-20 w-64 rounded-xl p-4 flex flex-col gap-4"
      style={{
        background: 'rgba(15,15,20,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-semibold text-white">
          Content Filters
        </span>
      </div>

      {/* Violence row */}
      {hasViolence && (
        <CategoryRow
          label="Violence"
          icon={<EyeOff className="w-3.5 h-3.5 text-red-400" />}
          current={preferences.violence}
          onChange={(v) => onChange({ ...preferences, violence: v })}
        />
      )}

      {/* Nudity row */}
      {hasNudity && (
        <CategoryRow
          label="Nudity"
          icon={<Eye className="w-3.5 h-3.5 text-pink-400" />}
          current={preferences.nudity}
          onChange={(v) => onChange({ ...preferences, nudity: v })}
        />
      )}

      {/* Hint */}
      <p className="text-[10px] text-white/40 leading-relaxed">
        Strict mode blurs the entire screen during detected scenes. Moderate
        mode blurs only detected regions.
      </p>
    </div>
  );
};
