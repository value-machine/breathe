import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BreathePage } from "./BreathePage";

describe("BreathePage", () => {
  it("should show the timer view when Play is pressed with the default settings", async () => {
    render(<BreathePage />);

    await userEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByRole("region", { name: "Breathing session" })).toBeInTheDocument();
    expect(screen.getByText("Breathe in")).toBeInTheDocument();
  });

  it("should return to the settings form when Stop is pressed during a session", async () => {
    render(<BreathePage />);
    await userEvent.click(screen.getByRole("button", { name: "Play" }));

    await userEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Breathing session" })).not.toBeInTheDocument();
  });
});
