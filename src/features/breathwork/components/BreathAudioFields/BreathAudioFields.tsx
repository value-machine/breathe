import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import type {
  BreathAudioMode,
  BreathAudioSettings,
  BreathAudioSettingsBounds,
} from "../../types/breathwork.types";

export interface BreathAudioFieldsProps {
  audio: BreathAudioSettings;
  bounds: BreathAudioSettingsBounds;
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

/** Sound settings: output mode, carrier frequency and the beat range across the breath. */
export const BreathAudioFields = ({ audio, bounds, onChange }: BreathAudioFieldsProps) => (
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
    <FormField
      label="Carrier (Hz)"
      type="number"
      inputMode="numeric"
      step={1}
      min={bounds.carrierHz.min}
      max={bounds.carrierHz.max}
      value={audio.carrierHz}
      onChange={(event) => onChange({ ...audio, carrierHz: Number(event.target.value) })}
    />
    <FormField
      label="Beat at the low point (Hz)"
      type="number"
      inputMode="numeric"
      step={1}
      min={bounds.beatLowHz.min}
      max={bounds.beatLowHz.max}
      value={audio.beatLowHz}
      onChange={(event) => onChange({ ...audio, beatLowHz: Number(event.target.value) })}
    />
    <FormField
      label="Beat at the high point (Hz)"
      type="number"
      inputMode="numeric"
      step={1}
      min={bounds.beatHighHz.min}
      max={bounds.beatHighHz.max}
      value={audio.beatHighHz}
      onChange={(event) => onChange({ ...audio, beatHighHz: Number(event.target.value) })}
    />
  </div>
);
