import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClippyProvider } from "@/app/_components/ClippyProvider";
import { ClippyButton } from "@/app/_components/ClippyButton";
import { ClippyWidget } from "@/app/_components/ClippyWidget";

vi.mock("clippyjs", () => ({
  initAgent: vi.fn(() =>
    Promise.resolve({
      show: vi.fn(),
      hide: vi.fn(),
      speak: vi.fn(),
      play: vi.fn(),
      animate: vi.fn(),
      stop: vi.fn(),
      dispose: vi.fn(),
    })
  ),
}));

vi.mock("clippyjs/agents/clippy", () => ({
  default: { agent: vi.fn(), sound: vi.fn(), map: vi.fn() },
}));

const defaultChat = {
  messages: [],
  sendMessage: vi.fn(),
  status: "ready" as const,
  error: undefined,
};

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => defaultChat),
}));

function Wrapper() {
  return (
    <ClippyProvider>
      <ClippyButton />
      <ClippyWidget />
    </ClippyProvider>
  );
}

describe("ClippyWidget", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useChat } = vi.mocked(await import("@ai-sdk/react"));
    useChat.mockReturnValue(defaultChat);
  });

  it("widget is present in DOM but hidden when isOpen is false", () => {
    render(<Wrapper />);
    const placeholder = screen.getByText(/It looks like you could use some help/i);
    expect(placeholder).toBeTruthy();
    // container has display:none when closed
    const hiddenRoot = placeholder.closest('[style*="display: none"]');
    expect(hiddenRoot).toBeTruthy();
  });

  it("widget becomes visible when ClippyButton is clicked", () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: /toggle clippy/i }));
    const placeholder = screen.getByText(/It looks like you could use some help/i);
    const hiddenRoot = placeholder.closest('[style*="display: none"]');
    expect(hiddenRoot).toBeNull();
  });

  it("renders text from message parts", async () => {
    const { useChat } = await import("@ai-sdk/react");
    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultChat,
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "Hello Clippy" }],
        },
        {
          id: "2",
          role: "assistant",
          parts: [{ type: "text", text: "It looks like you need help!" }],
        },
      ],
    });

    render(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: /toggle clippy/i }));
    expect(screen.getByText("Hello Clippy")).toBeTruthy();
    expect(screen.getByText("It looks like you need help!")).toBeTruthy();
  });

  it("shows error message when useChat reports an error", async () => {
    const { useChat } = await import("@ai-sdk/react");
    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultChat,
      error: new Error("Network error"),
    });

    render(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: /toggle clippy/i }));
    expect(
      screen.getByText(/something seems to have gone wrong/i)
    ).toBeTruthy();
  });

  it("calls sendMessage when Send button is clicked", async () => {
    const sendMessage = vi.fn();
    const { useChat } = await import("@ai-sdk/react");
    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultChat,
      sendMessage,
    });

    render(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: /toggle clippy/i }));

    fireEvent.change(screen.getByRole("textbox", { name: /ask clippy/i }), {
      target: { value: "What is airway management?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(sendMessage).toHaveBeenCalledWith(
      { text: "What is airway management?" },
      expect.objectContaining({ body: expect.objectContaining({ pageContext: expect.any(String) }) })
    );
  });
});
