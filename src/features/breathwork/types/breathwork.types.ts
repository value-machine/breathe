/** Settings the user configures before a breathing session. */
export interface BreathSettings {
  /** Inhale/exhale cycles before the hold sequence (integer). */
  breathsBeforeHold: number;
  /** Duration of each inhale and each exhale, in seconds (integer). */
  inhaleExhaleSeconds: number;
  /** Maximum hold, reached in the final round, in seconds (integer). */
  holdTargetSeconds: number;
  /** Number of complete rounds (integer). */
  rounds: number;
}

export type BreathPhaseKind = "inhale" | "exhale" | "hold";

/** One step of a session, in order. */
export interface BreathPhase {
  kind: BreathPhaseKind;
  seconds: number;
  /** 1-based round this phase belongs to. */
  round: number;
}

/** Allowed range for each numeric setting. */
export type BreathSettingsBounds = Record<keyof BreathSettings, { min: number; max: number }>;

export type BreathSettingsResult =
  | { ok: true; value: BreathSettings }
  | { ok: false; error: string };
