import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Progress } from "@/components/common/Progress";
import { cn } from "@/shared/utils/cn";
import type { BreathPhase, BreathPhaseKind } from "../../types/breathwork.types";
import type { BreathSessionStatus } from "../../hooks/useBreathSession";
import { BreathCircle } from "../BreathCircle/BreathCircle";

export interface BreathTimerViewProps {
  status: BreathSessionStatus;
  current: BreathPhase | null;
  circleScale: number;
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
  roundProgress,
  phaseRemainingSeconds,
  totalRounds,
  onPause,
  onResume,
  onStop,
}: BreathTimerViewProps) => {
  const isPaused = status === "paused";
  const roundPercent = Math.round(roundProgress * 100);
  const label = isPaused ? "Paused" : current ? PHASE_LABEL[current.kind] : "Done";

  return (
    <section
      aria-label="Breathing session"
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-between gap-6 py-6 sm:py-10"
    >
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          {current ? `Round ${current.round} of ${totalRounds}` : `${totalRounds} rounds`}
        </p>
        <Progress
          aria-label="Progress in this round"
          value={roundPercent}
          className="max-w-56"
          indicatorClassName="transition-transform duration-100 ease-linear"
        />
      </div>

      <BreathCircle
        scale={circleScale}
        phase={current?.kind ?? null}
        className={cn("transition-opacity duration-(--duration-slow)", isPaused && "opacity-60")}
      >
        <div className="flex flex-col items-center gap-1 text-center text-foreground">
          <p aria-live="polite" className="font-heading text-2xl">
            <span key={label} className="block animate-in duration-700 fade-in">
              {label}
            </span>
          </p>
          <p className="font-heading text-6xl lining-nums tabular-nums">
            {current ? phaseRemainingSeconds : 0}
          </p>
        </div>
      </BreathCircle>

      <div className="grid w-full grid-cols-3 items-center justify-items-center">
        <Button variant="outline" size="icon-lg" aria-label="Stop" onClick={onStop}>
          <Square aria-hidden="true" className="fill-current" />
        </Button>
        {isPaused ? (
          <Button size="icon-xl" aria-label="Resume" onClick={onResume}>
            <Play aria-hidden="true" className="translate-x-0.5 fill-current" />
          </Button>
        ) : (
          <Button size="icon-xl" aria-label="Pause" onClick={onPause}>
            <Pause aria-hidden="true" className="fill-current" />
          </Button>
        )}
      </div>
    </section>
  );
};
