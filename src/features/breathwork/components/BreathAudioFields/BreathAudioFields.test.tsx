import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AUDIO_SETTINGS_BOUNDS, DEFAULT_AUDIO_SETTINGS } from "../../services/breathCueService";
import { BreathAudioFields } from "./BreathAudioFields";

describe("BreathAudioFields", () => {
  it("should switch to speakers mode when Speakers is pressed", async () => {
    const onChange = vi.fn();
    render(
      <BreathAudioFields
        audio={DEFAULT_AUDIO_SETTINGS}
        bounds={AUDIO_SETTINGS_BOUNDS}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Speakers" }));

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_AUDIO_SETTINGS, mode: "speakers" });
  });

  it("should report the new carrier when the carrier field changes", () => {
    const onChange = vi.fn();
    render(
      <BreathAudioFields
        audio={DEFAULT_AUDIO_SETTINGS}
        bounds={AUDIO_SETTINGS_BOUNDS}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Carrier (Hz)"), { target: { value: "250" } });

    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_AUDIO_SETTINGS, carrierHz: 250 });
  });

  it("should mark the active mode as pressed when headphones mode is selected", () => {
    render(
      <BreathAudioFields
        audio={DEFAULT_AUDIO_SETTINGS}
        bounds={AUDIO_SETTINGS_BOUNDS}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Headphones" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
