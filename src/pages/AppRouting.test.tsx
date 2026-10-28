import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

vi.mock("@/shared/context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuthContext: () => ({
    user: null,
    loading: false,
    error: null,
    clearAuthError: vi.fn(),
    logout: vi.fn(),
    signInWithGoogle: vi.fn(),
  }),
}));

const visitPath = (path: string): void => {
  window.history.pushState({}, "", path);
};

describe("App routes", () => {
  afterEach(() => {
    visitPath("/");
  });

  it("should render the breathwork timer settings at the front door when the URL is /", async () => {
    visitPath("/");

    render(<App />);

    expect(await screen.findByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("should redirect to the front door when the URL is /breathe", async () => {
    visitPath("/breathe");

    render(<App />);

    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(await screen.findByRole("button", { name: "Play" })).toBeInTheDocument();
  });
});
