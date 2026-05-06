"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useClippy } from "./ClippyProvider";

type ClippyAgent = {
  show(fast?: boolean): boolean;
  hide(fast?: boolean, callback?: () => void): void;
  play(animation: string, timeout?: number, cb?: () => void): boolean;
  speak(text: string, hold?: boolean): void;
  animate(): boolean;
  stop(): void;
  dispose(): void;
};

function getMessageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("");
}

export function ClippyWidget() {
  const { isOpen, setIsOpen, pageContext } = useClippy();
  const agentRef = useRef<ClippyAgent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/clippy" }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Load the clippyjs agent once on mount
  useEffect(() => {
    let disposed = false;

    async function loadAgent() {
      const [{ initAgent }, { default: Clippy }] = await Promise.all([
        import("clippyjs"),
        import("clippyjs/agents/clippy"),
      ]);
      if (disposed) return;
      const agent = await initAgent(Clippy);
      if (disposed) {
        agent.dispose();
        return;
      }
      agentRef.current = agent;
    }

    loadAgent();
    return () => {
      disposed = true;
      agentRef.current?.dispose();
      agentRef.current = null;
    };
  }, []);

  // Show/hide Clippy character when panel opens/closes
  useEffect(() => {
    const agent = agentRef.current;
    if (!agent) return;
    if (isOpen) {
      agent.show(false);
      agent.play("Greeting");
    } else {
      agent.hide(false);
    }
  }, [isOpen]);

  // Mirror streaming state in Clippy animations
  useEffect(() => {
    const agent = agentRef.current;
    if (!agent) return;
    if (isStreaming) {
      agent.play("Thinking");
    } else if (messages.length > 0) {
      agent.play("Writing");
    }
  }, [isStreaming, messages.length]);

  // GetAttention on error
  useEffect(() => {
    if (error) agentRef.current?.play("GetAttention");
  }, [error]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");
    await sendMessage({ text }, { body: { pageContext } });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "28px",
        right: "8px",
        width: "264px",
        zIndex: 50,
        display: isOpen ? "flex" : "none",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* Win 3.11 chat panel */}
      <div
        className="win-raised"
        style={{ width: "100%", background: "#c0c0c0" }}
      >
        {/* Title bar */}
        <div className="win-titlebar">
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="11" height="13" viewBox="0 0 12 14" aria-hidden>
              <path
                d="M6 1.5C4 1.5 2.5 3 2.5 5L2.5 10C2.5 12 4 13 5.8 13C7.6 13 9 12 9 10L9 5.5C9 4 8 3.5 7 3.5C6 3.5 5 4 5 5.5L5 9C5 9.5 5.4 10 6 10C6.6 10 7 9.5 7 9L7 5.5"
                stroke="#ffffff"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            Clippy
          </span>
          <button
            className="win-titlebar-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close Clippy"
            style={{ fontSize: "8px" }}
          >
            ✕
          </button>
        </div>

        {/* Message history */}
        <div
          className="win-sunken-deep"
          style={{
            margin: "4px",
            background: "#ffffff",
            maxHeight: "220px",
            overflowY: "auto",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "10px",
          }}
        >
          {messages.length === 0 && !error && (
            <p style={{ color: "#808080", margin: 0, lineHeight: "1.5" }}>
              It looks like you could use some help! Ask me anything about this page.
            </p>
          )}

          {messages.map((msg) => {
            const text = getMessageText(
              msg.parts as { type: string; text?: string }[]
            );
            if (!text) return null;
            const isUser = msg.role === "user";
            const isLastAssistant =
              !isUser && msg === messages[messages.length - 1];
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  background: isUser ? "#000080" : "#ffffc0",
                  color: isUser ? "#ffffff" : "#000000",
                  border: !isUser ? "1px solid #808080" : "none",
                  padding: "3px 8px",
                  maxWidth: "92%",
                  lineHeight: "1.5",
                  wordBreak: "break-word",
                }}
              >
                {text}
                {isLastAssistant && isStreaming && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "6px",
                      height: "10px",
                      background: "#000000",
                      marginLeft: "2px",
                      verticalAlign: "text-bottom",
                      animation: "clippy-cursor-blink 0.8s step-end infinite",
                    }}
                  />
                )}
              </div>
            );
          })}

          {error && (
            <div
              style={{
                alignSelf: "flex-start",
                background: "#ffffc0",
                border: "1px solid #808080",
                padding: "3px 8px",
                maxWidth: "92%",
                lineHeight: "1.5",
                color: "#000000",
              }}
            >
              Hmm, something seems to have gone wrong. Want to try again?
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: "4px", padding: "0 4px 4px" }}>
          <input
            className="win-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask Clippy…"
            aria-label="Ask Clippy"
            style={{ flex: 1, fontSize: "10px" }}
          />
          <button
            className="win-btn"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            aria-label="Send"
            style={{ minWidth: 0, padding: "2px 10px", fontSize: "10px" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
