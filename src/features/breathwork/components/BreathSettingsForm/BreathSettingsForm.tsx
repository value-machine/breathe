import { Play, Volume2, VolumeX } from "lucide-react";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { NumberStepper } from "@/components/common/NumberStepper";
import { Switch } from "@/components/common/Switch";
import type {
  BreathAudioSettings,
  BreathAudioSettingsBounds,
  BreathEffectId,
  BreathEffectPreset,
  BreathSettings,
  BreathSettingsBounds,
} from "../../types/breathwork.types";
import { BreathAudioFields } from "../BreathAudioFields/BreathAudioFields";

export interface BreathSettingsFormProps {
  settings: BreathSettings;
  bounds: BreathSettingsBounds;
  audio: BreathAudioSettings;
  audioBounds: BreathAudioSettingsBounds;
  effectPresets: BreathEffectPreset[];
  onPickEffect: (effect: Exclude<BreathEffectId, "custom">) => void;
  /** Validation message for the current settings, or null when they are valid. */
  error: string | null;
  /** Hold of each round in seconds, or null while the settings are invalid. */
  holdPlan: number[] | null;
  /** Display length of the whole session (e.g. "7 min"), or null while invalid. */
  sessionLength: string | null;
  soundOn: boolean;
  onSettingsChange: (next: BreathSettings) => void;
  onAudioChange: (next: BreathAudioSettings) => void;
  onSoundToggle: () => void;
  onPlay: () => void;
}

type NumericSetting = keyof BreathSettings;

const FIELDS: { key: NumericSetting; label: string; unit?: string; step?: number }[] = [
  { key: "breathsBeforeHold", label: "Breaths before hold" },
  { key: "inhaleExhaleSeconds", label: "Inhale / exhale", unit: "s" },
  { key: "holdTargetSeconds", label: "Hold target", unit: "s", step: 5 },
  { key: "rounds", label: "Rounds" },
];

const surfaceClassName = "flex flex-col gap-5 rounded-card bg-card p-5 elevation-sm sm:p-6";

/** Settings page: the breathing parameters, the sound switch with its audio fields, and Play. */
export const BreathSettingsForm = ({
  settings,
  bounds,
  audio,
  audioBounds,
  effectPresets,
  onPickEffect,
  error,
  holdPlan,
  sessionLength,
  soundOn,
  onSettingsChange,
  onAudioChange,
  onSoundToggle,
  onPlay,
}: BreathSettingsFormProps) => (
  <form
    className="mx-auto flex w-full max-w-lg flex-col gap-5 pt-6 sm:pt-10"
    onSubmit={(event) => {
      event.preventDefault();
      onPlay();
    }}
  >
    <header className="flex flex-col items-center gap-2 text-center">
      <h1 className="font-heading text-4xl font-medium tracking-tight text-foreground">
        Set your rhythm
      </h1>
      <p className="text-muted-foreground">Choose a pattern and a sound, then press play.</p>
    </header>

    <section aria-labelledby="breathing-heading" className={surfaceClassName}>
      <h2 id="breathing-heading" className="font-heading text-xl font-medium">
        Breathing
      </h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5">
        {FIELDS.map(({ key, label, unit, step }) => (
          <NumberStepper
            key={key}
            label={label}
            unit={unit}
            step={step}
            min={bounds[key].min}
            max={bounds[key].max}
            value={settings[key]}
            hint={
              key === "holdTargetSeconds" && holdPlan
                ? `Holds: ${holdPlan.join(" · ")} s`
                : undefined
            }
            onValueChange={(value) => onSettingsChange({ ...settings, [key]: value })}
          />
        ))}
      </div>
    </section>

    <section aria-labelledby="sound-heading" className={surfaceClassName}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="sound-heading" className="flex items-center gap-2 font-heading text-xl font-medium">
          {soundOn ? (
            <Volume2 aria-hidden="true" className="size-5 text-primary" />
          ) : (
            <VolumeX aria-hidden="true" className="size-5 text-muted-foreground" />
          )}
          Sound
        </h2>
        <Switch aria-label="Sound" checked={soundOn} onCheckedChange={onSoundToggle} />
      </div>
      {soundOn ? (
        <BreathAudioFields
          audio={audio}
          bounds={audioBounds}
          presets={effectPresets}
          onPickEffect={onPickEffect}
          onChange={onAudioChange}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Silent session: follow the circle and the phase labels.
        </p>
      )}
    </section>

    {error && <Alert variant="destructive">{error}</Alert>}

    <div className="sticky bottom-0 flex flex-col items-center gap-2 bg-linear-to-t from-background from-60% to-transparent pt-8 pb-6">
      <Button type="submit" size="lg" className="min-w-48" disabled={error !== null}>
        <Play aria-hidden="true" className="fill-current" />
        Play
      </Button>
      {sessionLength && (
        <p className="text-sm text-muted-foreground">
          About {sessionLength} · {settings.rounds} {settings.rounds === 1 ? "round" : "rounds"}
        </p>
      )}
    </div>
  </form>
);
