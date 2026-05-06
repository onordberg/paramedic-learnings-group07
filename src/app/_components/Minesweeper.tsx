"use client";

import { useState, useEffect, useCallback } from "react";

const ROWS = 9;
const COLS = 9;
const MINES = 10;
const CELL_PX = 24;

type CellState = "covered" | "revealed" | "flagged" | "question";
type GamePhase = "idle" | "playing" | "won" | "lost";

interface Cell {
  isMine: boolean;
  adjacent: number;
  state: CellState;
}

function makeBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ isMine: false, adjacent: 0, state: "covered" as CellState }))
  );
}

function withMines(board: Cell[][], safeR: number, safeC: number): Cell[][] {
  const b = board.map((r) => r.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if ((r !== safeR || c !== safeC) && !b[r][c].isMine) {
      b[r][c].isMine = true;
      placed++;
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (b[r][c].isMine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].isMine) n++;
        }
      b[r][c].adjacent = n;
    }
  }
  return b;
}

function floodReveal(board: Cell[][], startR: number, startC: number): Cell[][] {
  const b = board.map((r) => r.map((c) => ({ ...c })));
  const q: [number, number][] = [[startR, startC]];
  while (q.length > 0) {
    const [r, c] = q.shift()!;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (b[r][c].state !== "covered") continue;
    b[r][c].state = "revealed";
    if (b[r][c].adjacent === 0)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) q.push([r + dr, c + dc]);
  }
  return b;
}

function isWon(board: Cell[][]): boolean {
  return board.every((row) => row.every((cell) => cell.isMine || cell.state === "revealed"));
}

function flagCount(board: Cell[][]): number {
  return board.reduce((sum, row) => sum + row.filter((c) => c.state === "flagged").length, 0);
}

function cellSrc(cell: Cell, phase: GamePhase, exploded: [number, number] | null, r: number, c: number): string {
  const base = "/images/minesweeper/";
  if (phase === "lost") {
    if (exploded && exploded[0] === r && exploded[1] === c) return `${base}tile-mine-exploded.svg`;
    if (cell.isMine) return cell.state === "flagged" ? `${base}tile-flag.svg` : `${base}tile-mine.svg`;
    if (cell.state === "flagged") return `${base}tile-mine-wrong.svg`;
  }
  if (cell.state === "covered") return `${base}tile-covered.svg`;
  if (cell.state === "flagged") return `${base}tile-flag.svg`;
  if (cell.state === "question") return `${base}tile-question.svg`;
  if (cell.isMine) return `${base}tile-mine.svg`;
  if (cell.adjacent === 0) return `${base}tile-empty.svg`;
  return `${base}tile-${cell.adjacent}.svg`;
}

function LcdDisplay({ value }: { value: number }) {
  const v = Math.max(-99, Math.min(999, value));
  const text = v < 0 ? "-" + Math.abs(v).toString().padStart(2, "0") : v.toString().padStart(3, "0");
  return (
    <div
      style={{
        background: "#000",
        color: "#ff0000",
        fontFamily: '"Courier New", "Lucida Console", monospace',
        fontSize: "20px",
        fontWeight: "bold",
        padding: "1px 3px",
        letterSpacing: "2px",
        border: "2px solid",
        borderColor: "#808080 #ffffff #ffffff #808080",
        userSelect: "none",
        minWidth: "46px",
        textAlign: "right",
      }}
    >
      {text}
    </div>
  );
}

interface MinesweeperProps {
  onClose: () => void;
}

export function Minesweeper({ onClose }: MinesweeperProps) {
  const [board, setBoard] = useState<Cell[][]>(makeBoard);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [exploded, setExploded] = useState<[number, number] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [pos, setPos] = useState({ x: 120, y: 80 });
  const [drag, setDrag] = useState<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setElapsed((e) => Math.min(999, e + 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Dragging
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const x = drag.posX + (e.clientX - drag.startX);
      const y = drag.posY + (e.clientY - drag.startY);
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 240, x)),
        y: Math.max(0, Math.min(window.innerHeight - 30, y)),
      });
    };
    const onUp = () => setDrag(null);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [drag]);

  // Release pressing state on any mouse-up
  useEffect(() => {
    const onUp = () => setPressing(false);
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []);

  const reset = useCallback(() => {
    setBoard(makeBoard());
    setPhase("idle");
    setExploded(null);
    setElapsed(0);
    setPressing(false);
  }, []);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (phase === "won" || phase === "lost") return;
      const cell = board[r][c];
      if (cell.state !== "covered") return;

      let b = board;
      if (phase === "idle") {
        b = withMines(board, r, c);
        setPhase("playing");
      }

      if (b[r][c].isMine) {
        const blown = b.map((row) =>
          row.map((cell) => {
            if (cell.isMine && cell.state !== "flagged") return { ...cell, state: "revealed" as CellState };
            return cell;
          })
        );
        setExploded([r, c]);
        setPhase("lost");
        setBoard(blown);
        return;
      }

      const revealed = floodReveal(b, r, c);
      if (isWon(revealed)) {
        setPhase("won");
        setBoard(
          revealed.map((row) =>
            row.map((cell) => (cell.isMine ? { ...cell, state: "flagged" as CellState } : cell))
          )
        );
        return;
      }

      setBoard(revealed);
    },
    [phase, board]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (phase === "won" || phase === "lost") return;
      const cell = board[r][c];
      if (cell.state === "revealed") return;
      const cycle: Record<string, CellState> = { covered: "flagged", flagged: "question", question: "covered" };
      setBoard((prev) =>
        prev.map((row, ri) =>
          row.map((cell, ci) =>
            ri === r && ci === c ? { ...cell, state: cycle[cell.state] ?? cell.state } : cell
          )
        )
      );
    },
    [phase, board]
  );

  const flags = flagCount(board);
  const smileySrc = `/images/minesweeper/${
    phase === "won" ? "smiley-win" : phase === "lost" ? "smiley-dead" : pressing ? "smiley-click" : "smiley-ready"
  }.svg`;

  return (
    <div
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 1000, userSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Double outer border */}
      <div style={{ border: "2px solid", borderColor: "#dfdfdf #404040 #404040 #dfdfdf" }}>
        <div style={{ border: "2px solid", borderColor: "#ffffff #808080 #808080 #ffffff", background: "#c0c0c0" }}>

          {/* Title bar */}
          <div
            className="win-titlebar"
            style={{ cursor: "default" }}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest(".win-titlebar-btn")) return;
              e.preventDefault();
              setDrag({ startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y });
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/minesweeper/app-icon.svg" alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} />
              <span>Minesweeper</span>
            </div>
            <button type="button" className="win-titlebar-btn" onClick={onClose} style={{ cursor: "default" }}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "6px" }}>

            {/* Header panel: mine counter | smiley | timer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 6px",
                marginBottom: "6px",
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                background: "#c0c0c0",
              }}
            >
              <LcdDisplay value={MINES - flags} />

              <button
                type="button"
                onMouseDown={(e) => { if (e.button === 0) setPressing(true); }}
                onMouseUp={() => { setPressing(false); reset(); }}
                onMouseLeave={() => setPressing(false)}
                style={{
                  background: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#ffffff #808080 #808080 #ffffff",
                  padding: "2px",
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={smileySrc} alt="Reset" width={26} height={26} style={{ imageRendering: "pixelated" }} />
              </button>

              <LcdDisplay value={elapsed} />
            </div>

            {/* Grid */}
            <div
              style={{
                border: "2px solid",
                borderColor: "#808080 #ffffff #ffffff #808080",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              {board.map((row, r) => (
                <div key={r} style={{ display: "flex" }}>
                  {row.map((cell, c) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c}
                      src={cellSrc(cell, phase, exploded, r, c)}
                      alt=""
                      width={CELL_PX}
                      height={CELL_PX}
                      style={{ imageRendering: "pixelated", display: "block", cursor: "default" }}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleRightClick(e, r, c)}
                      onMouseDown={(e) => {
                        if (e.button === 0 && phase !== "won" && phase !== "lost" && cell.state === "covered")
                          setPressing(true);
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
