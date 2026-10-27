import { useEffect } from "react";
import type { BreathAudioController } from "../../hooks/useBreathAudio";
import { useBreathSession } from "../../hooks/useBreathSession";
import type { BreathAudioSettings, BreathPhase } from "../../types/breathwork.types";
import { BreathTimerView } from "../BreathTimerView/BreathTimerView";

export interface BreathSessionScreenProps {
  phases: BreathPhase[];
  audio: BreathAudioController;
  audioSettings: BreathAudioSettings;
  /** Called when the session finishes or the user stops it. */
  onExit: () => void;
}

/** Runs one breathing session from start to finish and reports when it is over. */
export const BreathSessionScreen = ({
  phases,
  audio,
  audioSettings,
  onExit,
}: BreathSessionScreenProps) => {
  const session = useBreathSession(phases);
  const { start, stop, status } = session;

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    audio.begin(phases, audioSettings);
  }, [audio, phases, audioSettings]);

  useEffect(() => {
    if (status === "paused") audio.pause();
    if (status === "running") audio.resume();
  }, [audio, status]);

  useEffect(() => {
    if (status === "finished") onExit();
  }, [status, onExit]);

  const handleStop = (): void => {
    stop();
    onExit();
  };

  return (
    <BreathTimerView
      status={status}
      current={session.current}
      circleScale={session.circleScale}
      echoCount={session.echoCount}
      roundProgress={session.roundProgress}
      phaseRemainingSeconds={session.phaseRemainingSeconds}
      totalRounds={phases[phases.length - 1]?.round ?? 0}
      onPause={session.pause}
      onResume={session.resume}
      onStop={handleStop}
    />
  );
};
