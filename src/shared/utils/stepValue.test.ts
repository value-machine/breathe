import { describe, expect, it } from "vitest";
import { stepValue } from "./stepValue";

const bounds = { min: 5, max: 300, step: 5 };

describe("stepValue", () => {
  it("should add one step when the value is on the step grid", () => {
    expect(stepValue(60, 1, bounds)).toBe(65);
  });

  it("should snap up to the next grid value when the value is off the grid", () => {
    expect(stepValue(62, 1, bounds)).toBe(65);
  });

  it("should snap down to the previous grid value when the value is off the grid", () => {
    expect(stepValue(62, -1, bounds)).toBe(60);
  });

  it("should clamp to the minimum when stepping below it", () => {
    expect(stepValue(5, -1, bounds)).toBe(5);
  });

  it("should clamp to the maximum when stepping above it", () => {
    expect(stepValue(300, 1, bounds)).toBe(300);
  });
});
