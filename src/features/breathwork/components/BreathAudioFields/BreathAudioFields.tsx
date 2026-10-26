import { useState } from "react";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import type {
  BreathAudioMode,
  BreathAudioSettings,
  BreathAudioSettingsBounds,
  BreathEffectId,
  BreathEffectPreset,
} from "../../types/breathwork.types";

export interface BreathAudioFieldsProps {
  audio: BreathAudioSettings;
  bounds: BreathAudioSettingsBounds;
  presets: BreathEffectPreset[];
  /** Applies a preset: sets its Hz values and keeps the output mode. */
  onPickEffect: (effect: Exclude<BreathEffectId, "custom">) => void;
  onChange: (next: BreathAudioSettings) => void;
}

const MODES: { mode: BreathAudioMode; label: string }[] = [
  { mode: "headphones", label: "Headphones" },
  { mode: "speakers", label: "Speakers" },
];

const HELP: Record<BreathAudioMode, string> = {
  headphones: "Headphones: each ear hears its own tone, so the beat is in your head.",
  speakers: "Speakers: the carrier pulses at the beat rate. No headphones needed.",
};

/** What is synthesised for a preset: band, beat range and carrier. No effect claims. */
const describePreset = (preset: BreathEffectPreset): string =>
  `${preset.band} band · beat ${preset.beatLowHz}–${preset.beatHighHz} Hz · carrier ${preset.carrierHz} Hz`;

/** Effect picker, output mode and an advanced Hz section that is hidden by default. */
export const BreathAudioFields = ({
  audio,
  bounds,
  presets,
  onPickEffect,
  onChange,
}: BreathAudioFieldsProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const selected = presets.find((preset) => preset.id === audio.effect);

  const editHz = (next: Partial<BreathAudioSettings>): void => {
    onChange({ ...audio, ...next, effect: "custom" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Sound mode" className="flex gap-3">
        {MODES.map(({ mode, label }) => (
          <Button
            key={mode}
            type="button"
            className="flex-1"
            variant={audio.mode === mode ? "secondary" : "outline"}
            aria-pressed={audio.mode === mode}
            onClick={() => onChange({ ...audio, mode })}
          >
            {label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{HELP[audio.mode]}</p>

      <div role="group" aria-label="Effect" className="flex flex-col gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant={audio.effect === preset.id ? "secondary" : "outline"}
            aria-pressed={audio.effect === preset.id}
            onClick={() => onPickEffect(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {selected ? describePreset(selected) : "Custom values (advanced)"}
      </p>

      <Button
        type="button"
        variant="ghost"
        aria-expanded={advancedOpen}
        onClick={() => setAdvancedOpen((open) => !open)}
      >
        Advanced
      </Button>
      {advancedOpen && (
        <div className="flex flex-col gap-4">
          <FormField
            label="Carrier (Hz)"
            type="number"
            inputMode="numeric"
            step={1}
            min={bounds.carrierHz.min}
            max={bounds.carrierHz.max}
            value={audio.carrierHz}
            onChange={(event) => editHz({ carrierHz: Number(event.target.value) })}
          />
          <FormField
            label="Beat at the low point (Hz)"
            type="number"
            inputMode="numeric"
            step={1}
            min={bounds.beatLowHz.min}
            max={bounds.beatLowHz.max}
            value={audio.beatLowHz}
            onChange={(event) => editHz({ beatLowHz: Number(event.target.value) })}
          />
          <FormField
            label="Beat at the high point (Hz)"
            type="number"
            inputMode="numeric"
            step={1}
            min={bounds.beatHighHz.min}
            max={bounds.beatHighHz.max}
            value={audio.beatHighHz}
            onChange={(event) => editHz({ beatHighHz: Number(event.target.value) })}
          />
        </div>
      )}
    </div>
  );
};
