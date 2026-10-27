import type {
  BreathAudioMode,
  BreathAudioSettings,
  BreathAudioSettingsBounds,
  BreathEffectId,
  BreathEffectPreset,
  BreathPhase,
  BreathPhaseKind,
} from "../types/breathwork.types";

export type { BreathAudioMode, BreathAudioSettings, BreathEffectId, BreathEffectPreset };

/**
 * Effect presets. The label names the goal the user picks; the band names what is synthesised
 * (EEG band applied to a number, not a promise). Values are carrier and beat range in Hz.
 */
export const EFFECT_PRESETS: BreathEffectPreset[] = [
  { id: "calm", label: "Calm", band: "theta", carrierHz: 200, beatLowHz: 4, beatHighHz: 8 },
  { id: "focus", label: "Focus", band: "beta", carrierHz: 200, beatLowHz: 13, beatHighHz: 20 },
  { id: "sleep", label: "Sleep", band: "delta", carrierHz: 150, beatLowHz: 1, beatHighHz: 4 },
  {
    id: "energize",
    label: "Energize",
    band: "beta / low gamma",
    carrierHz: 250,
    beatLowHz: 20,
    beatHighHz: 30,
  },
];

/** Settings for a chosen preset, keeping the output mode. */
export const audioSettingsForEffect = (
  effect: Exclude<BreathEffectId, "custom">,
  mode: BreathAudioMode
): BreathAudioSettings => {
  const preset = EFFECT_PRESETS.find((p) => p.id === effect);
  if (!preset) throw new Error(`Unknown effect: ${effect}`);
  return {
    mode,
    effect,
    carrierHz: preset.carrierHz,
    beatLowHz: preset.beatLowHz,
    beatHighHz: preset.beatHighHz,
  };
};

export const DEFAULT_AUDIO_SETTINGS: BreathAudioSettings = audioSettingsForEffect(
  "calm",
  "headphones"
);

export const AUDIO_SETTINGS_BOUNDS: BreathAudioSettingsBounds = {
  carrierHz: { min: 100, max: 400 },
  beatLowHz: { min: 1, max: 40 },
  beatHighHz: { min: 1, max: 40 },
} as const;

/** Beat frequency at the start and end of a phase, in Hz. The beat ramps linearly between them. */
export interface BeatRange {
  startHz: number;
  endHz: number;
}

/** What to play for one phase. */
export interface BreathCueSpec {
  mode: BreathAudioMode;
  carrierHz: number;
  beatStartHz: number;
  beatEndHz: number;
  seconds: number;
  peakGain: number;
}

const BREATH_PEAK_GAIN = 0.15;
const HOLD_GAIN_SHARE = 0.5;
/** Level changes at each phase boundary take this long, so the sound crossfades instead of gapping. */
const CROSSFADE_SECONDS = 0.3;
const SILENCE_GAIN = 0.0001;

/** Cue for a phase: the given beat range and the level for the phase kind. */
export const cueForPhase = (
  phase: BreathPhase,
  audio: BreathAudioSettings,
  beat: BeatRange
): BreathCueSpec => ({
  mode: audio.mode,
  carrierHz: audio.carrierHz,
  beatStartHz: beat.startHz,
  beatEndHz: beat.endHz,
  seconds: phase.seconds,
  peakGain: phase.kind === "hold" ? BREATH_PEAK_GAIN * HOLD_GAIN_SHARE : BREATH_PEAK_GAIN,
});

/**
 * Breath swing: how far the beat moves above and below the session trend on each breath. A
 * quarter of the range keeps the whole movement inside beat low to beat high.
 */
const breathSwingHz = (audio: BreathAudioSettings): number =>
  (audio.beatHighHz - audio.beatLowHz) / 4;

/**
 * Session trend: the centre of the beat, moving linearly from the high end to the low end over
 * the whole session. Guides the listener from the higher beat toward the lower one.
 */
const trendHz = (audio: BreathAudioSettings, elapsed: number, total: number): number => {
  const swing = breathSwingHz(audio);
  const from = audio.beatHighHz - swing;
  const to = audio.beatLowHz + swing;
  return from + (to - from) * (total > 0 ? elapsed / total : 0);
};

/**
 * Beat range for each phase, in order. Each breath swings above (after an inhale) or below
 * (after an exhale) the trend. A hold keeps the side of the last breath and follows the trend.
 * Every phase starts where the previous one ended, so the beat is continuous.
 */
const beatRangesForSession = (phases: BreathPhase[], audio: BreathAudioSettings): BeatRange[] => {
  const swing = breathSwingHz(audio);
  const total = phases.reduce((sum, phase) => sum + phase.seconds, 0);
  let elapsed = 0;
  let side: 1 | -1 = -1;
  return phases.map((phase) => {
    const startSide = side;
    const endSide = phase.kind === "inhale" ? 1 : phase.kind === "exhale" ? -1 : startSide;
    const range = {
      startHz: trendHz(audio, elapsed, total) + startSide * swing,
      endHz: trendHz(audio, elapsed + phase.seconds, total) + endSide * swing,
    };
    side = endSide;
    elapsed += phase.seconds;
    return range;
  });
};

/**
 * The sound sources for one session. Headphones: a fixed carrier in the left ear and a right
 * ear whose frequency carries the beat. Speakers: a fixed carrier whose loudness is driven by
 * an LFO that carries the beat. Either way the beat parameter takes absolute Hz as
 * beatOffsetHz + beat.
 */
interface Voice {
  output: AudioNode;
  sources: OscillatorNode[];
  beat: AudioParam;
  beatOffsetHz: number;
}

const createBinauralVoice = (ctx: AudioContext, carrierHz: number): Voice => {
  const merger = ctx.createChannelMerger(2);
  const left = ctx.createOscillator();
  const right = ctx.createOscillator();
  left.frequency.value = carrierHz;
  left.connect(merger, 0, 0);
  right.connect(merger, 0, 1);
  return { output: merger, sources: [left, right], beat: right.frequency, beatOffsetHz: carrierHz };
};

const createIsochronicVoice = (ctx: AudioContext, carrierHz: number): Voice => {
  const carrier = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const modulation = ctx.createGain();
  const depth = ctx.createGain();
  carrier.frequency.value = carrierHz;
  // Base 0.7 with depth 0.3 keeps the level between 0.4 and 1, so the tone pulses instead of gating off.
  modulation.gain.value = 0.7;
  depth.gain.value = 0.3;
  carrier.connect(modulation);
  lfo.connect(depth);
  depth.connect(modulation.gain);
  return { output: modulation, sources: [carrier, lfo], beat: lfo.frequency, beatOffsetHz: 0 };
};

const createVoice = (ctx: AudioContext, audio: BreathAudioSettings): Voice =>
  audio.mode === "headphones"
    ? createBinauralVoice(ctx, audio.carrierHz)
    : createIsochronicVoice(ctx, audio.carrierHz);

/** Chime kinds: one per phase kind, plus the round end. */
export type ChimeKind = BreathPhaseKind | "roundEnd";

/** One chime: its offset in seconds from the start of the session, and what it marks. */
export interface ChimeEvent {
  at: number;
  kind: ChimeKind;
}

/**
 * When each chime plays. A phase start gets its chime, except a phase that starts a new round:
 * there the round-end chime plays instead (D5). Every round ends with a round-end chime,
 * including the last one.
 */
export const chimeSchedule = (phases: BreathPhase[]): ChimeEvent[] => {
  const events: ChimeEvent[] = [];
  let at = 0;
  phases.forEach((phase, index) => {
    const previous = phases[index - 1];
    const next = phases[index + 1];
    const startsRound = previous !== undefined && previous.round !== phase.round;
    if (!startsRound) events.push({ at, kind: phase.kind });
    at += phase.seconds;
    const endsRound = next === undefined || next.round !== phase.round;
    if (endsRound) events.push({ at, kind: "roundEnd" });
  });
  return events;
};

/** Cue for each phase, in order, from the session beat plan. */
const cuesForSession = (phases: BreathPhase[], audio: BreathAudioSettings): BreathCueSpec[] =>
  beatRangesForSession(phases, audio).map((range, index) =>
    cueForPhase(phases[index], audio, range)
  );

/** Automates the beat across the session. Each phase starts where the previous one ended. */
const scheduleSessionBeat = (voice: Voice, cues: BreathCueSpec[], startAt: number): void => {
  let at = startAt;
  for (const cue of cues) {
    voice.beat.setValueAtTime(voice.beatOffsetHz + cue.beatStartHz, at);
    voice.beat.linearRampToValueAtTime(voice.beatOffsetHz + cue.beatEndHz, at + cue.seconds);
    at += cue.seconds;
  }
};

/** Automates the level: silence, then a crossfade at each phase boundary, then silence at the end. */
const scheduleSessionLevel = (level: GainNode, cues: BreathCueSpec[], window: CueWindow): void => {
  level.gain.setValueAtTime(SILENCE_GAIN, window.start);
  let at = window.start;
  let previousPeak = SILENCE_GAIN;
  for (const cue of cues) {
    level.gain.setValueAtTime(previousPeak, at);
    level.gain.linearRampToValueAtTime(cue.peakGain, at + CROSSFADE_SECONDS);
    previousPeak = cue.peakGain;
    at += cue.seconds;
  }
  level.gain.setValueAtTime(previousPeak, window.end - CROSSFADE_SECONDS);
  level.gain.linearRampToValueAtTime(SILENCE_GAIN, window.end);
};

/** Start and end of the session on the AudioContext clock, in seconds. */
interface CueWindow {
  start: number;
  end: number;
}

const CHIME_PEAK_GAIN = 0.12;
const CHIME_ATTACK_SECONDS = 0.02;
const CHIME_DECAY_SECONDS = 1.2;
/** Pitch per chime kind, in Hz: inhale high, exhale low, hold a neutral third, round end distinct. */
const CHIME_HZ: Record<ChimeKind, number> = {
  inhale: 659.25,
  exhale: 440,
  hold: 523.25,
  roundEnd: 783.99,
};

/** One soft sine chime at its time, on its own gain so it sits over the bed. */
const scheduleChime = (ctx: AudioContext, event: ChimeEvent, startAt: number): void => {
  const at = startAt + event.at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = CHIME_HZ[event.kind];
  gain.gain.setValueAtTime(SILENCE_GAIN, at);
  gain.gain.linearRampToValueAtTime(CHIME_PEAK_GAIN, at + CHIME_ATTACK_SECONDS);
  gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, at + CHIME_DECAY_SECONDS);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + CHIME_DECAY_SECONDS);
};

/** Schedules one chime per chime event of the session, on the same clock as the bed. */
const scheduleBreathChimes = (ctx: AudioContext, phases: BreathPhase[], startAt: number): void => {
  for (const event of chimeSchedule(phases)) scheduleChime(ctx, event, startAt);
};

/**
 * Schedules a whole session as one continuous voice from now. Beat and level are automated per
 * phase on the AudioContext clock, so phase changes are crossfades, not gaps. Suspending the
 * context pauses the session exactly where it is.
 */
export const scheduleBreathSession = (
  ctx: AudioContext,
  phases: BreathPhase[],
  audio: BreathAudioSettings
): void => {
  const cues = cuesForSession(phases, audio);
  const window: CueWindow = {
    start: ctx.currentTime,
    end: ctx.currentTime + cues.reduce((sum, cue) => sum + cue.seconds, 0),
  };
  const voice = createVoice(ctx, audio);
  const level = ctx.createGain();
  voice.output.connect(level);
  level.connect(ctx.destination);

  scheduleSessionBeat(voice, cues, window.start);
  scheduleSessionLevel(level, cues, window);
  for (const source of voice.sources) {
    source.start(window.start);
    source.stop(window.end);
  }
  scheduleBreathChimes(ctx, phases, window.start);
};

/** Returns a message for the first invalid audio setting, or null when all are valid. */
export const validateAudioSettings = (audio: BreathAudioSettings): string | null => {
  const { carrierHz, beatLowHz, beatHighHz } = audio;
  const { min: carrierMin, max: carrierMax } = AUDIO_SETTINGS_BOUNDS.carrierHz;
  if (carrierHz < carrierMin || carrierHz > carrierMax) {
    return `carrier must be between ${carrierMin} and ${carrierMax} Hz`;
  }
  const { min: beatMin, max: beatMax } = AUDIO_SETTINGS_BOUNDS.beatLowHz;
  if (beatLowHz < beatMin || beatLowHz > beatMax || beatHighHz < beatMin || beatHighHz > beatMax) {
    return `beat must be between ${beatMin} and ${beatMax} Hz`;
  }
  if (beatLowHz > beatHighHz) return "beat low must not be above beat high";
  return null;
};
