import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLimitEcho } from "./useLimitEcho";

const createRing = () => ({ animate: vi.fn() });

const mockReducedMotion = (reduced: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: reduced }))
  );
};

describe("useLimitEcho", () => {
  beforeEach(() => mockReducedMotion(false));
  afterEach(() => vi.unstubAllGlobals());

  it("should animate the ring once when the echo count goes up", () => {
    const ring = createRing();
    const ref = { current: ring as unknown as HTMLDivElement };
    const { rerender } = renderHook(({ count }) => useLimitEcho(ref, count, 1), {
      initialProps: { count: 1 },
    });

    rerender({ count: 2 });

    expect(ring.animate).toHaveBeenCalledTimes(1);
  });

  it("should start the echo at the circle's current scale when the circle is at its smallest", () => {
    const ring = createRing();
    const ref = { current: ring as unknown as HTMLDivElement };
    const { rerender } = renderHook(({ count, scale }) => useLimitEcho(ref, count, scale), {
      initialProps: { count: 1, scale: 0.5 },
    });

    rerender({ count: 2, scale: 0.5 });

    expect(ring.animate).toHaveBeenCalledWith(
      [
        { transform: "scale(0.5)", opacity: 0.6 },
        { transform: "scale(0.65)", opacity: 0 },
      ],
      expect.any(Object)
    );
  });

  it("should not animate on mount when the echo count is already above zero", () => {
    const ring = createRing();
    const ref = { current: ring as unknown as HTMLDivElement };

    renderHook(() => useLimitEcho(ref, 3, 1));

    expect(ring.animate).not.toHaveBeenCalled();
  });

  it("should not animate when the echo count is zero", () => {
    const ring = createRing();
    const ref = { current: ring as unknown as HTMLDivElement };

    renderHook(() => useLimitEcho(ref, 0, 1));

    expect(ring.animate).not.toHaveBeenCalled();
  });

  it("should not animate again when the echo count stays the same", () => {
    const ring = createRing();
    const ref = { current: ring as unknown as HTMLDivElement };
    const { rerender } = renderHook(({ count }) => useLimitEcho(ref, count, 1), {
      initialProps: { count: 2 },
    });
    ring.animate.mockClear();

    rerender({ count: 2 });

    expect(ring.animate).not.toHaveBeenCalled();
  });

  it("should not animate when the user prefers reduced motion", () => {
    mockReducedMotion(true);
    const ring = createRing();
    const ref = { current: ring as unknown as HTMLDivElement };
    const { rerender } = renderHook(({ count }) => useLimitEcho(ref, count, 1), {
      initialProps: { count: 1 },
    });

    rerender({ count: 2 });

    expect(ring.animate).not.toHaveBeenCalled();
  });
});
