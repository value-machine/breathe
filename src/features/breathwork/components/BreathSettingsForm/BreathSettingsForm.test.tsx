import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  BREATH_SETTINGS_BOUNDS,
  DEFAULT_BREATH_SETTINGS,
} from "../../services/breathSessionService";
import { BreathSettingsForm } from "./BreathSettingsForm";

const renderForm = (overrides: Partial<Parameters<typeof BreathSettingsForm>[0]> = {}) => {
  const props = {
    settings: DEFAULT_BREATH_SETTINGS,
    bounds: BREATH_SETTINGS_BOUNDS,
    error: null,
    soundOn: true,
    onSettingsChange: vi.fn(),
    onSoundToggle: vi.fn(),
    onPlay: vi.fn(),
    ...overrides,
  };
  render(<BreathSettingsForm {...props} />);
  return props;
};

describe("BreathSettingsForm", () => {
  it("should call onPlay when the user presses Play and the settings are valid", async () => {
    const props = renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(props.onPlay).toHaveBeenCalledTimes(1);
  });

  it("should show the error and disable Play when the settings are invalid", () => {
    renderForm({ error: "rounds must be between 1 and 10" });

    expect(screen.getByText("rounds must be between 1 and 10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
  });

  it("should report the new value when a number field changes", async () => {
    const props = renderForm();

    fireEvent.change(screen.getByLabelText("Number of rounds"), { target: { value: "5" } });

    expect(props.onSettingsChange).toHaveBeenLastCalledWith({
      ...DEFAULT_BREATH_SETTINGS,
      rounds: 5,
    });
  });
});
