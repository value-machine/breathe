import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import type { BreathSettings, BreathSettingsBounds } from "../../types/breathwork.types";

export interface BreathSettingsFormProps {
  settings: BreathSettings;
  bounds: BreathSettingsBounds;
  /** Validation message for the current settings, or null when they are valid. */
  error: string | null;
  soundOn: boolean;
  onSettingsChange: (next: BreathSettings) => void;
  onSoundToggle: () => void;
  onPlay: () => void;
}

type NumericSetting = keyof BreathSettings;

const FIELDS: { key: NumericSetting; label: string }[] = [
  { key: "breathsBeforeHold", label: "Breaths before hold" },
  { key: "inhaleExhaleSeconds", label: "Inhale / exhale (seconds)" },
  { key: "holdTargetSeconds", label: "Breath hold target (seconds)" },
  { key: "rounds", label: "Number of rounds" },
];

/** Settings page: the four breathing parameters, the sound switch and the Play button. */
export const BreathSettingsForm = ({
  settings,
  bounds,
  error,
  soundOn,
  onSettingsChange,
  onSoundToggle,
  onPlay,
}: BreathSettingsFormProps) => (
  <form
    className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8"
    onSubmit={(event) => {
      event.preventDefault();
      onPlay();
    }}
  >
    {FIELDS.map(({ key, label }) => (
      <FormField
        key={key}
        label={label}
        type="number"
        inputMode="numeric"
        step={1}
        min={bounds[key].min}
        max={bounds[key].max}
        value={settings[key]}
        onChange={(event) => onSettingsChange({ ...settings, [key]: Number(event.target.value) })}
      />
    ))}
    <Button type="button" variant="outline" aria-pressed={soundOn} onClick={onSoundToggle}>
      Sound: {soundOn ? "on" : "off"}
    </Button>
    {error && <Alert variant="destructive">{error}</Alert>}
    <Button type="submit" size="lg" disabled={error !== null}>
      Play
    </Button>
  </form>
);
