// src/components/BoardStack.tsx
"use client";
import { useState } from "react";
import { Board } from "./Board";
import type { Board as BoardType } from "~/types/game";

export const BOARD_SIZE = 10;
export const createBoard = (): BoardType =>
  Array.from({ length: BOARD_SIZE }, (): string[] => Array(BOARD_SIZE).fill("") as string[]) as BoardType;

export const BoardStack = () => {
  const [activeBoard, setActiveBoard] = useState<"player" | "bot">("player");
  const [playerBoard, setPlayerBoard] = useState<BoardType>(createBoard());
  const [botBoard, setBotBoard] = useState<BoardType>(createBoard());
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="flex h-full w-full items-center justify-evenly">
      <div className="border-1 border border-black">
        <div>{"stats"}</div>
      </div>
      <div className="relative h-[600px] w-[545px]">
        {/* Player Board */}
        <div
          className={`absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${
            activeBoard === "player"
              ? "z-30 translate-x-[-50%] translate-y-[-50%]"
              : "z-20 translate-x-[-45%] translate-y-[-47%] opacity-75"
          }`}
        >
          <Board
            board={{
              id: "player-board",
              boardData: playerBoard,
              activeBoard,
              setActiveBoard,
              setBoardData: setPlayerBoard,
              gameStarted,
              setGameStarted,
            }}
          />
        </div>

        {/* Bot Board */}
        <div
          className={`absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${
            activeBoard === "bot"
              ? "z-30 translate-x-[-50%] translate-y-[-72%]"
              : "z-20 translate-x-[-45%] translate-y-[-67%] opacity-75"
          }`}
        >
          <Board
            board={{
              id: "bot-board",
              boardData: botBoard,
              activeBoard,
              setActiveBoard,
              setBoardData: setBotBoard,
              gameStarted,
              setGameStarted,
            }}
          />
        </div>
      </div>
      <div className="border-1 flex flex-col items-center justify-center border border-black">
        <label htmlFor="first-move">First Move</label>
        <select
          className="border-none bg-transparent"
          disabled={gameStarted}
          onChange={(e) => {
            if (e.target.value === "random") {
              setActiveBoard(Math.random() > 0.5 ? "player" : "bot");
            } else {
              setActiveBoard(e.target.value as "player" | "bot");
            }
          }}
          name="first-move"
          id="first-move"
        >
          <option value="random">Random</option>
          <option value="player">Opponent</option>
          <option value="bot">Player</option>
        </select>
      </div>
    </div>
  );
};
