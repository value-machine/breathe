import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "tests/test-utils";
import { Topbar } from "./Topbar";

vi.mock("@/layouts/ProfileMenu", () => ({
  ProfileMenu: () => <button type="button">Theme</button>,
}));

describe("Topbar", () => {
  it("should link the app name to the front door when the top bar is shown", () => {
    renderWithProviders(<Topbar />);

    const brand = screen.getByRole("link", { name: "Breathwork Timer" });
    expect(brand).toHaveAttribute("href", "/");
  });

  it("should not show the template name when the top bar is shown", () => {
    renderWithProviders(<Topbar />);

    expect(screen.queryByText("Plate Harness")).not.toBeInTheDocument();
  });
});
