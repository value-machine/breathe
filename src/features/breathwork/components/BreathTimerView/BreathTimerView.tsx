import { Button } from "@/components/common/Button";
import type { BreathPhase, BreathPhaseKind } from "../../types/breathwork.types";
import type { BreathSessionStatus } from "../../hooks/useBreathSession";
import { BreathCircle } from "../BreathCircle/BreathCircle";

export interface BreathTimerViewProps {
  status: BreathSessionStatus;
  current: BreathPhase | null;
  circleScale: number;
  /** Breath limits passed so far; each new one plays the echo ring. */
  echoCount: number;
  /** Share of the current round that has elapsed, from 0 to 1. */
  roundProgress: number;
  phaseRemainingSeconds: number;
  totalRounds: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const PHASE_LABEL: Record<BreathPhaseKind, string> = {
  inhale: "Breathe in",
  exhale: "Breathe out",
  hold: "Hold",
};

/** Timer page: the breathing circle, the current phase, round progress and the session controls. */
export const BreathTimerView = ({
  status,
  current,
  circleScale,
  echoCount,
  roundProgress,
  phaseRemainingSeconds,
  totalRounds,
  onPause,
  onResume,
  onStop,
}: BreathTimerViewProps) => {
  const isPaused = status === "paused";
  const roundPercent = Math.round(roundProgress * 100);

  return (
    <section
      aria-label="Breathing session"
      className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center gap-8 px-4 py-8"
    >
      <div className="flex h-72 items-center justify-center">
        <BreathCircle scale={circleScale} echoCount={echoCount} />
      </div>
      <p aria-live="polite" className="font-heading text-2xl text-foreground">
        {isPaused ? "Paused" : current ? PHASE_LABEL[current.kind] : "Done"}
      </p>
      <p className="text-4xl tabular-nums text-foreground">{current ? phaseRemainingSeconds : 0}</p>
      <div className="w-full">
        <div
          role="progressbar"
          aria-label="Progress in this round"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundPercent}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${roundPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {current ? `Round ${current.round} of ${totalRounds}` : `${totalRounds} rounds`}
        </p>
      </div>
      <div className="flex w-full gap-3">
        {isPaused ? (
          <Button className="flex-1" onClick={onResume}>
            Resume
          </Button>
        ) : (
          <Button className="flex-1" variant="secondary" onClick={onPause}>
            Pause
          </Button>
        )}
        <Button className="flex-1" variant="outline" onClick={onStop}>
          Stop
        </Button>
      </div>
    </section>
  );
};
