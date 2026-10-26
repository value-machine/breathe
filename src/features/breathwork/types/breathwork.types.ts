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

export type BreathAudioMode = "headphones" | "speakers";

/** An effect preset the user picks, or "custom" once the advanced Hz values are edited. */
export type BreathEffectId = "calm" | "focus" | "sleep" | "energize" | "custom";

/** One effect preset: the goal label, the band it synthesises, and its Hz values. */
export interface BreathEffectPreset {
  id: Exclude<BreathEffectId, "custom">;
  label: string;
  band: string;
  carrierHz: number;
  beatLowHz: number;
  beatHighHz: number;
}

/** Audio settings the user can change. */
export interface BreathAudioSettings {
  mode: BreathAudioMode;
  effect: BreathEffectId;
  /** Tone heard in the left ear (headphones) or carried by the speaker (speakers), in Hz. */
  carrierHz: number;
  /** Beat frequency at the start of an inhale and the end of an exhale, in Hz. */
  beatLowHz: number;
  /** Beat frequency at the end of an inhale and the start of an exhale, in Hz. */
  beatHighHz: number;
}

/** Allowed range for each numeric audio setting. */
export type BreathAudioSettingsBounds = Record<
  Exclude<keyof BreathAudioSettings, "mode" | "effect">,
  { min: number; max: number }
>;

export type BreathSettingsResult =
  | { ok: true; value: BreathSettings }
  | { ok: false; error: string };
