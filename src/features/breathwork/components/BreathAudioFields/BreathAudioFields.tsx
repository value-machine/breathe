import { useState, type ReactNode } from "react";
import { ChevronDown, Leaf, Moon, Sun, Target } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/common/Collapsible";
import { NumberStepper } from "@/components/common/NumberStepper";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { cn } from "@/shared/utils/cn";
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

const MODES: { value: BreathAudioMode; label: string }[] = [
  { value: "headphones", label: "Headphones" },
  { value: "speakers", label: "Speakers" },
];

const HELP: Record<BreathAudioMode, string> = {
  headphones: "Each ear hears its own tone, so the beat is in your head.",
  speakers: "The tone pulses at the beat rate. No headphones needed.",
};

const EFFECT_ICON: Record<BreathEffectPreset["id"], ReactNode> = {
  calm: <Leaf />,
  focus: <Target />,
  sleep: <Moon />,
  energize: <Sun />,
};

/** What is synthesised for a preset: band and beat range. No effect claims. */
const describePreset = (preset: BreathEffectPreset): string =>
  `${preset.band} · ${preset.beatLowHz}–${preset.beatHighHz} Hz`;

/** Effect picker, output mode and an advanced Hz section that is hidden by default. */
export const BreathAudioFields = ({
  audio,
  bounds,
  presets,
  onPickEffect,
  onChange,
}: BreathAudioFieldsProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const editHz = (next: Partial<BreathAudioSettings>): void => {
    onChange({ ...audio, ...next, effect: "custom" });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <SegmentedControl
          aria-label="Sound mode"
          options={MODES}
          value={audio.mode}
          onValueChange={(mode) => onChange({ ...audio, mode })}
        />
        <p className="px-1 text-xs text-muted-foreground">{HELP[audio.mode]}</p>
      </div>

      <div role="group" aria-label="Effect" className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <ChoiceCard
            key={preset.id}
            label={preset.label}
            description={describePreset(preset)}
            icon={EFFECT_ICON[preset.id]}
            selected={audio.effect === preset.id}
            onClick={() => onPickEffect(preset.id)}
          />
        ))}
      </div>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="self-start px-2">
            Advanced
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "transition-transform duration-(--duration-normal)",
                advancedOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        {audio.effect === "custom" && (
          <p className="px-2 text-xs text-muted-foreground">Custom values</p>
        )}
        <CollapsibleContent className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberStepper
            label="Carrier (Hz)"
            min={bounds.carrierHz.min}
            max={bounds.carrierHz.max}
            step={10}
            value={audio.carrierHz}
            onValueChange={(carrierHz) => editHz({ carrierHz })}
          />
          <NumberStepper
            label="Beat low (Hz)"
            min={bounds.beatLowHz.min}
            max={bounds.beatLowHz.max}
            value={audio.beatLowHz}
            onValueChange={(beatLowHz) => editHz({ beatLowHz })}
          />
          <NumberStepper
            label="Beat high (Hz)"
            min={bounds.beatHighHz.min}
            max={bounds.beatHighHz.max}
            value={audio.beatHighHz}
            onValueChange={(beatHighHz) => editHz({ beatHighHz })}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
