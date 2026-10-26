import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AUDIO_SETTINGS_BOUNDS,
  DEFAULT_AUDIO_SETTINGS,
  EFFECT_PRESETS,
} from "../../services/breathCueService";
import { BreathAudioFields } from "./BreathAudioFields";

const renderFields = (onChange = vi.fn(), onPickEffect = vi.fn()) => {
  render(
    <BreathAudioFields
      audio={DEFAULT_AUDIO_SETTINGS}
      bounds={AUDIO_SETTINGS_BOUNDS}
      presets={EFFECT_PRESETS}
      onPickEffect={onPickEffect}
      onChange={onChange}
    />
  );
  return { onChange, onPickEffect };
};

describe("BreathAudioFields", () => {
  it("should switch to speakers mode when Speakers is pressed", async () => {
    const { onChange } = renderFields();

    await userEvent.click(screen.getByRole("button", { name: "Speakers" }));

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_AUDIO_SETTINGS, mode: "speakers" });
  });

  it("should pick the focus effect when Focus is pressed", async () => {
    const { onPickEffect } = renderFields();

    await userEvent.click(screen.getByRole("button", { name: "Focus" }));

    expect(onPickEffect).toHaveBeenCalledWith("focus");
  });

  it("should hide the Hz fields when the advanced section is closed", () => {
    renderFields();

    expect(screen.queryByLabelText("Carrier (Hz)")).not.toBeInTheDocument();
  });

  it("should show the Hz fields when Advanced is pressed", async () => {
    renderFields();

    await userEvent.click(screen.getByRole("button", { name: "Advanced" }));

    expect(screen.getByLabelText("Carrier (Hz)")).toBeInTheDocument();
  });

  it("should switch the effect to custom when a Hz value is edited in advanced", async () => {
    const { onChange } = renderFields();
    await userEvent.click(screen.getByRole("button", { name: "Advanced" }));

    fireEvent.change(screen.getByLabelText("Carrier (Hz)"), { target: { value: "250" } });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ effect: "custom", carrierHz: 250 })
    );
  });

  it("should mark the Calm effect as pressed when the default settings are shown", () => {
    renderFields();

    expect(screen.getByRole("button", { name: "Calm" })).toHaveAttribute("aria-pressed", "true");
  });
});
