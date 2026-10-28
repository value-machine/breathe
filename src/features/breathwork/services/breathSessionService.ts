import type {
  BreathPhase,
  BreathSettings,
  BreathSettingsBounds,
  BreathSettingsResult,
} from "../types/breathwork.types";

/** Fixed length of the second hold in every round (design spec § 2.1). */
export const HOLD_FINAL_SECONDS = 15;

/** Allowed ranges for each setting (inclusive, integers). */
export const BREATH_SETTINGS_BOUNDS: BreathSettingsBounds = {
  breathsBeforeHold: { min: 1, max: 20 },
  inhaleExhaleSeconds: { min: 1, max: 20 },
  holdTargetSeconds: { min: 5, max: 300 },
  rounds: { min: 1, max: 10 },
} as const;

/** Starting values for the settings page. */
export const DEFAULT_BREATH_SETTINGS: BreathSettings = {
  breathsBeforeHold: 3,
  inhaleExhaleSeconds: 4,
  holdTargetSeconds: 60,
  rounds: 3,
};

type SettingKey = keyof BreathSettings;

const checkSetting = (key: SettingKey, value: number): string | null => {
  const { min, max } = BREATH_SETTINGS_BOUNDS[key];
  if (!Number.isInteger(value)) return `${key} must be a whole number`;
  if (value < min || value > max) return `${key} must be between ${min} and ${max}`;
  return null;
};

/** Rejects out-of-range or non-integer settings; never clamps (D6). */
export const validateBreathSettings = (settings: BreathSettings): BreathSettingsResult => {
  const keys = Object.keys(BREATH_SETTINGS_BOUNDS) as SettingKey[];
  for (const key of keys) {
    const error = checkSetting(key, settings[key]);
    if (error) return { ok: false, error };
  }
  return { ok: true, value: settings };
};

/**
 * Hold length for a round. The last round uses the full target; earlier rounds use
 * one third (round 1) or two thirds (round 2 and later). Rounded to whole seconds (D4).
 */
export const holdSecondsForRound = (
  round: number,
  rounds: number,
  targetSeconds: number
): number => {
  if (round >= rounds) return targetSeconds;
  return Math.round((targetSeconds * Math.min(round, 2)) / 3);
};

const roundPhases = (settings: BreathSettings, round: number): BreathPhase[] => {
  const { breathsBeforeHold, inhaleExhaleSeconds, holdTargetSeconds, rounds } = settings;
  const breathing: BreathPhase[] = [];
  for (let breath = 0; breath < breathsBeforeHold; breath += 1) {
    breathing.push({ kind: "inhale", seconds: inhaleExhaleSeconds, round });
    breathing.push({ kind: "exhale", seconds: inhaleExhaleSeconds, round });
  }
  const holdSeconds = holdSecondsForRound(round, rounds, holdTargetSeconds);
  return [
    ...breathing,
    { kind: "hold", seconds: holdSeconds, round },
    { kind: "inhale", seconds: inhaleExhaleSeconds, round },
    { kind: "hold", seconds: HOLD_FINAL_SECONDS, round },
    { kind: "exhale", seconds: inhaleExhaleSeconds, round },
  ];
};

/** Full ordered phase list for a session. Settings must already be valid. */
export const buildBreathPhases = (settings: BreathSettings): BreathPhase[] => {
  const phases: BreathPhase[] = [];
  for (let round = 1; round <= settings.rounds; round += 1) {
    phases.push(...roundPhases(settings, round));
  }
  return phases;
};

/** Where a running session is: which phase, and how much of it is left. */
export interface BreathSessionProgress {
  phaseIndex: number;
  remainingMs: number;
}

export const startBreathProgress = (phases: BreathPhase[]): BreathSessionProgress => ({
  phaseIndex: 0,
  remainingMs: (phases[0]?.seconds ?? 0) * 1000,
});

/**
 * Moves progress forward by elapsed time, carrying any overshoot into the next phase.
 * Returns null once the last phase has ended.
 */
export const advanceBreathProgress = (
  phases: BreathPhase[],
  progress: BreathSessionProgress,
  elapsedMs: number
): BreathSessionProgress | null => {
  let phaseIndex = progress.phaseIndex;
  let remainingMs = progress.remainingMs - elapsedMs;
  while (remainingMs <= 0) {
    phaseIndex += 1;
    if (phaseIndex >= phases.length) return null;
    remainingMs += phases[phaseIndex].seconds * 1000;
  }
  return { phaseIndex, remainingMs };
};

/**
 * Whether the circle should be expanded at a phase. Holds keep the size of the last breath,
 * so the circle stays still through a hold.
 */
export const isCircleExpanded = (phases: BreathPhase[], phaseIndex: number): boolean => {
  for (let index = phaseIndex; index >= 0; index -= 1) {
    const { kind } = phases[index];
    if (kind !== "hold") return kind === "inhale";
  }
  return false;
};

/** Circle size range as scale factors: contracted (after an exhale) to expanded (after an inhale). */
/**
 * Breath limits passed before the phase at `phaseIndex`: each inhale (full size) and exhale
 * (smallest size) that has ended. Holds reach no new limit, so they do not count. The count
 * changes once per limit, which drives the golden echo ring.
 */
export const limitEchoCount = (phases: BreathPhase[], phaseIndex: number): number =>
  phases.slice(0, phaseIndex).filter((phase) => phase.kind === "inhale" || phase.kind === "exhale")
    .length;

export const CIRCLE_MIN_SCALE = 0.5;
export const CIRCLE_MAX_SCALE = 1;

/**
 * Circle scale at the current point of a session. Inhale grows across the whole inhale,
 * exhale shrinks across the whole exhale, and a hold keeps the size of the last breath.
 */
export const circleScaleAt = (phases: BreathPhase[], progress: BreathSessionProgress): number => {
  const phase = phases[progress.phaseIndex];
  if (!phase) return CIRCLE_MIN_SCALE;
  if (phase.kind === "hold") {
    return isCircleExpanded(phases, progress.phaseIndex) ? CIRCLE_MAX_SCALE : CIRCLE_MIN_SCALE;
  }
  const elapsedShare = 1 - progress.remainingMs / (phase.seconds * 1000);
  const span = CIRCLE_MAX_SCALE - CIRCLE_MIN_SCALE;
  return phase.kind === "inhale"
    ? CIRCLE_MIN_SCALE + span * elapsedShare
    : CIRCLE_MAX_SCALE - span * elapsedShare;
};

/** Share of the current round that has elapsed, from 0 at its start to 1 at its end. */
export const roundProgressAt = (phases: BreathPhase[], progress: BreathSessionProgress): number => {
  const current = phases[progress.phaseIndex];
  if (!current) return 0;
  let roundMs = 0;
  let elapsedBeforeCurrentMs = 0;
  phases.forEach((phase, index) => {
    if (phase.round !== current.round) return;
    roundMs += phase.seconds * 1000;
    if (index < progress.phaseIndex) elapsedBeforeCurrentMs += phase.seconds * 1000;
  });
  const elapsedInCurrentMs = current.seconds * 1000 - progress.remainingMs;
  return (elapsedBeforeCurrentMs + elapsedInCurrentMs) / roundMs;
};
