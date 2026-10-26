import { useCallback, useMemo, useState } from "react";
import { BreathSessionScreen } from "@/features/breathwork/components/BreathSessionScreen/BreathSessionScreen";
import { BreathSettingsForm } from "@/features/breathwork/components/BreathSettingsForm/BreathSettingsForm";
import {
  BREATH_SETTINGS_BOUNDS,
  buildBreathPhases,
  DEFAULT_BREATH_SETTINGS,
  validateBreathSettings,
} from "@/features/breathwork/services/breathSessionService";
import type { BreathPhase, BreathSettings } from "@/features/breathwork/types/breathwork.types";

/** Breathwork timer: settings first, then a session, then back to settings. */
export const BreathePage = () => {
  const [settings, setSettings] = useState<BreathSettings>(DEFAULT_BREATH_SETTINGS);
  const [soundOn, setSoundOn] = useState(true);
  const [sessionPhases, setSessionPhases] = useState<BreathPhase[] | null>(null);

  const validation = useMemo(() => validateBreathSettings(settings), [settings]);
  const error = validation.ok ? null : validation.error;

  const handlePlay = useCallback(() => {
    if (validation.ok) setSessionPhases(buildBreathPhases(validation.value));
  }, [validation]);

  const handleExit = useCallback(() => setSessionPhases(null), []);

  if (sessionPhases) {
    return <BreathSessionScreen phases={sessionPhases} onExit={handleExit} />;
  }

  return (
    <BreathSettingsForm
      settings={settings}
      bounds={BREATH_SETTINGS_BOUNDS}
      error={error}
      soundOn={soundOn}
      onSettingsChange={setSettings}
      onSoundToggle={() => setSoundOn((on) => !on)}
      onPlay={handlePlay}
    />
  );
};
