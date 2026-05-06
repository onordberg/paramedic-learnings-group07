import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  WindowStateProvider,
  useWindowState,
  MinimizeButton,
  WindowBody,
} from "@/app/_components/WindowStateContext";

// Renders context values as data attributes so tests can inspect state
function Inspector() {
  const { isMinimized, minimize, restore } = useWindowState();
  return (
    <div data-testid="inspector" data-minimized={String(isMinimized)}>
      <button onClick={minimize}>minimize</button>
      <button onClick={restore}>restore</button>
    </div>
  );
}

describe("useWindowState", () => {
  it("throws when used outside WindowStateProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<Inspector />)).toThrow(
        "useWindowState must be used inside WindowStateProvider"
      );
    } finally {
      spy.mockRestore();
    }
  });

  it("starts with isMinimized false", () => {
    render(<WindowStateProvider><Inspector /></WindowStateProvider>);
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("false");
  });

  it("minimize() sets isMinimized to true", () => {
    render(<WindowStateProvider><Inspector /></WindowStateProvider>);
    fireEvent.click(screen.getByRole("button", { name: "minimize" }));
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("true");
  });

  it("restore() sets isMinimized back to false", () => {
    render(<WindowStateProvider><Inspector /></WindowStateProvider>);
    fireEvent.click(screen.getByRole("button", { name: "minimize" }));
    fireEvent.click(screen.getByRole("button", { name: "restore" }));
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("false");
  });
});

describe("MinimizeButton", () => {
  it("renders a button with the minimize glyph", () => {
    render(
      <WindowStateProvider>
        <MinimizeButton />
      </WindowStateProvider>
    );
    expect(screen.getByRole("button", { name: "Minimize" })).toBeTruthy();
  });

  it("calls minimize() on click", () => {
    render(
      <WindowStateProvider>
        <MinimizeButton />
        <Inspector />
      </WindowStateProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Minimize" }));
    expect(screen.getByTestId("inspector").dataset.minimized).toBe("true");
  });
});

describe("WindowBody", () => {
  it("renders children when not minimized", () => {
    render(
      <WindowStateProvider>
        <WindowBody><span>content</span></WindowBody>
      </WindowStateProvider>
    );
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders null when minimized", () => {
    render(
      <WindowStateProvider>
        <MinimizeButton />
        <WindowBody><span>content</span></WindowBody>
      </WindowStateProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Minimize" }));
    expect(screen.queryByText("content")).toBeNull();
  });
});
