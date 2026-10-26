import { useCallback, useMemo, useState } from "react";
import { BreathSessionScreen } from "@/features/breathwork/components/BreathSessionScreen/BreathSessionScreen";
import { BreathSettingsForm } from "@/features/breathwork/components/BreathSettingsForm/BreathSettingsForm";
import { useBreathAudio } from "@/features/breathwork/hooks/useBreathAudio";
import {
  BREATH_SETTINGS_BOUNDS,
  buildBreathPhases,
  DEFAULT_BREATH_SETTINGS,
  validateBreathSettings,
} from "@/features/breathwork/services/breathSessionService";
import {
  audioSettingsForEffect,
  AUDIO_SETTINGS_BOUNDS,
  DEFAULT_AUDIO_SETTINGS,
  EFFECT_PRESETS,
  validateAudioSettings,
} from "@/features/breathwork/services/breathCueService";
import type {
  BreathAudioSettings,
  BreathPhase,
  BreathSettings,
} from "@/features/breathwork/types/breathwork.types";
import { appScrollContentClassName } from "@/shared/theme/appViewLayout";

/** Breathwork timer: settings first, then a session, then back to settings. */
export const BreathePage = () => {
  const [settings, setSettings] = useState<BreathSettings>(DEFAULT_BREATH_SETTINGS);
  const [audio, setAudio] = useState<BreathAudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [soundOn, setSoundOn] = useState(true);
  const [sessionPhases, setSessionPhases] = useState<BreathPhase[] | null>(null);
  const breathAudio = useBreathAudio();

  const validation = useMemo(() => validateBreathSettings(settings), [settings]);
  const error = validation.ok ? (soundOn ? validateAudioSettings(audio) : null) : validation.error;

  const handlePlay = useCallback(() => {
    if (!validation.ok || error) return;
    breathAudio.prepare(soundOn);
    setSessionPhases(buildBreathPhases(validation.value));
  }, [validation, error, soundOn, breathAudio]);

  const handleExit = useCallback(() => {
    breathAudio.stop();
    setSessionPhases(null);
  }, [breathAudio]);

  if (sessionPhases) {
    return (
      <div className={appScrollContentClassName}>
        <BreathSessionScreen
          phases={sessionPhases}
          audio={breathAudio}
          audioSettings={audio}
          onExit={handleExit}
        />
      </div>
    );
  }

  return (
    <div className={appScrollContentClassName}>
      <BreathSettingsForm
        settings={settings}
        bounds={BREATH_SETTINGS_BOUNDS}
        audio={audio}
        audioBounds={AUDIO_SETTINGS_BOUNDS}
        effectPresets={EFFECT_PRESETS}
        onPickEffect={(effect) => setAudio(audioSettingsForEffect(effect, audio.mode))}
        error={error}
        soundOn={soundOn}
        onSettingsChange={setSettings}
        onAudioChange={setAudio}
        onSoundToggle={() => setSoundOn((on) => !on)}
        onPlay={handlePlay}
      />
    </div>
  );
};
