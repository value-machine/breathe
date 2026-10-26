import { Button } from "@/components/common/Button";
import { cn } from "@/shared/utils/cn";
import type { BreathPhase, BreathPhaseKind } from "../../types/breathwork.types";
import { BreathCircle } from "../BreathCircle/BreathCircle";
import type { BreathSessionStatus } from "../../hooks/useBreathSession";

export interface BreathTimerViewProps {
  status: BreathSessionStatus;
  current: BreathPhase | null;
  circleExpanded: boolean;
  phaseRemainingSeconds: number;
  roundsRemaining: number;
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

/** Timer page: the breathing circle, the current phase, rounds left and the session controls. */
export const BreathTimerView = ({
  status,
  current,
  circleExpanded,
  phaseRemainingSeconds,
  roundsRemaining,
  totalRounds,
  onPause,
  onResume,
  onStop,
}: BreathTimerViewProps) => {
  const isPaused = status === "paused";
  const completedRounds = totalRounds - roundsRemaining;
  const progressPercent = totalRounds === 0 ? 0 : (completedRounds / totalRounds) * 100;

  return (
    <section
      aria-label="Breathing session"
      className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center gap-8 px-4 py-8"
    >
      <div className="flex h-72 items-center justify-center">
        <BreathCircle expanded={circleExpanded} />
      </div>
      <p aria-live="polite" className="font-heading text-2xl text-foreground">
        {isPaused ? "Paused" : current ? PHASE_LABEL[current.kind] : "Done"}
      </p>
      <p className="text-4xl tabular-nums text-foreground">{current ? phaseRemainingSeconds : 0}</p>
      <div className="w-full">
        <div
          role="progressbar"
          aria-label="Rounds completed"
          aria-valuemin={0}
          aria-valuemax={totalRounds}
          aria-valuenow={completedRounds}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full bg-primary transition-[width] ease-standard")}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Round {Math.min(completedRounds + 1, totalRounds)} of {totalRounds}
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
