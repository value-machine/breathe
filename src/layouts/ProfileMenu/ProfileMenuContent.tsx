import { ColorModeToggle } from "./ColorModeToggle";

/** The menu holds only the color mode toggle; the breathwork app needs no account. */
export const ProfileMenuContent = () => (
  <div className="flex justify-end">
    <ColorModeToggle />
  </div>
);
