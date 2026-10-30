import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberStepper } from "./NumberStepper";

const renderStepper = (value: number, onValueChange = vi.fn()) => {
  render(
    <NumberStepper
      label="Hold target"
      value={value}
      min={5}
      max={300}
      step={5}
      unit="s"
      onValueChange={onValueChange}
    />
  );
  return onValueChange;
};

describe("NumberStepper", () => {
  it("should report the next step when the increase button is pressed", async () => {
    const onValueChange = renderStepper(60);

    await userEvent.click(screen.getByRole("button", { name: "Increase Hold target" }));

    expect(onValueChange).toHaveBeenCalledWith(65);
  });

  it("should disable the decrease button when the value is at the minimum", () => {
    renderStepper(5);

    expect(screen.getByRole("button", { name: "Decrease Hold target" })).toBeDisabled();
  });

  it("should report a typed value when the input changes", () => {
    const onValueChange = renderStepper(60);

    fireEvent.change(screen.getByLabelText("Hold target"), { target: { value: "42" } });

    expect(onValueChange).toHaveBeenCalledWith(42);
  });
});
