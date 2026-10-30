export interface StepValueOptions {
  min: number;
  max: number;
  step: number;
}

/**
 * Next value for a stepper button. Snaps to the step grid first, so a typed 62 with step 5
 * goes to 65 (up) or 60 (down), then clamps to the bounds.
 */
export const stepValue = (
  value: number,
  direction: 1 | -1,
  { min, max, step }: StepValueOptions
): number => {
  const onGrid = value % step === 0;
  const snapped =
    direction === 1
      ? Math.floor(value / step) * step + step
      : (onGrid ? value : Math.ceil(value / step) * step) - step;
  return Math.min(max, Math.max(min, snapped));
};
