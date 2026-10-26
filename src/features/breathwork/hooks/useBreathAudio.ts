import { useMemo, useRef } from "react";
import { scheduleBreathSession, type BreathAudioSettings } from "../services/breathCueService";
import type { BreathPhase } from "../types/breathwork.types";

/** Controls the session's audio. The page owns it, so it can be created inside the Play click. */
export interface BreathAudioController {
  /** Call inside the Play click. Creates the AudioContext when sound is on. */
  prepare: (enabled: boolean) => void;
  /** Schedules the whole session on the AudioContext clock. Runs once per prepare. */
  begin: (phases: BreathPhase[], audio: BreathAudioSettings) => void;
  pause: () => void;
  resume: () => void;
  /** Closes the context. Call when the session ends or is stopped. */
  stop: () => void;
}

const getAudioContextCtor = (): typeof AudioContext | null => {
  const webkitCtor = (window as unknown as { webkitAudioContext?: typeof AudioContext })
    .webkitAudioContext;
  return window.AudioContext ?? webkitCtor ?? null;
};

/** Owns one AudioContext per session. Without a context (sound off, or no Web Audio) it does nothing. */
export const useBreathAudio = (): BreathAudioController => {
  const ctxRef = useRef<AudioContext | null>(null);
  const scheduledRef = useRef(false);

  return useMemo<BreathAudioController>(() => {
    const stop = (): void => {
      void ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
      scheduledRef.current = false;
    };

    return {
      prepare: (enabled) => {
        stop();
        const Ctor = getAudioContextCtor();
        if (!enabled || !Ctor) return;
        const ctx = new Ctor();
        ctxRef.current = ctx;
        void ctx.resume().catch(() => {});
      },
      begin: (phases, audio) => {
        const ctx = ctxRef.current;
        if (!ctx || scheduledRef.current) return;
        scheduledRef.current = true;
        scheduleBreathSession(ctx, phases, audio);
      },
      pause: () => {
        void ctxRef.current?.suspend().catch(() => {});
      },
      resume: () => {
        void ctxRef.current?.resume().catch(() => {});
      },
      stop,
    };
  }, []);
};
