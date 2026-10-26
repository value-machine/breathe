import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BreathTimerView, type BreathTimerViewProps } from "./BreathTimerView";

const baseProps: BreathTimerViewProps = {
  status: "running",
  current: { kind: "inhale", seconds: 4, round: 1 },
  circleExpanded: true,
  phaseRemainingSeconds: 3,
  roundsRemaining: 2,
  totalRounds: 3,
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
};

describe("BreathTimerView", () => {
  it("should show the phase label and remaining seconds when a phase is running", () => {
    render(<BreathTimerView {...baseProps} />);

    expect(screen.getByText("Breathe in")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should call onPause when Pause is pressed during a running session", async () => {
    const onPause = vi.fn();
    render(<BreathTimerView {...baseProps} onPause={onPause} />);

    await userEvent.click(screen.getByRole("button", { name: "Pause" }));

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("should show Resume and the paused label when the session is paused", () => {
    render(<BreathTimerView {...baseProps} status="paused" />);

    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("should call onStop when Stop is pressed", async () => {
    const onStop = vi.fn();
    render(<BreathTimerView {...baseProps} onStop={onStop} />);

    await userEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
