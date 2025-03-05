// src/components/BoardStack.tsx
"use client";
import { act, useEffect, useState } from "react";
import { Board } from "./Board";
import type { Board as BoardType, GameEventMessage } from "~/types/game";
import ChatBox from "./ChatBox";
import DetailsBox from "./DetailsBox";
import {
  gameEventMessages,
  getGameMessage,
  prologueMessages,
} from "../helpers/ChatHelpers";

export const BOARD_SIZE = 10;
export const createBoard = (): BoardType =>
  Array.from(
    { length: BOARD_SIZE },
    (): string[] => Array(BOARD_SIZE).fill("") as string[],
  ) as BoardType;

export const BoardStack = () => {
  const [activeBoard, setActiveBoard] = useState<"player" | "bot">("player");
  const [playerBoard, setPlayerBoard] = useState<BoardType>(createBoard());
  const [botBoard, setBotBoard] = useState<BoardType>(createBoard());
  const [gameStarted, setGameStarted] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentGameEvent, setCurrentGameEvent] = useState(prologueMessages[0]);

  useEffect(() => {
    if (!gameStarted) {
      // Cycle through prologue messages
      const timer = setInterval(() => {
        setCurrentEventIndex((prev) =>
          Math.min(prev + 1, prologueMessages.length - 1),
        );
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) {
      // For prologue, just use the current index
      setCurrentGameEvent(prologueMessages[currentEventIndex]);
    } else {
      // For game events, find the first message set and use its turn message
      const turnMessage = gameEventMessages[0]?.find(
        (msg) => msg.trigger === "turn" && msg.active !== activeBoard,
      );
      if (turnMessage) {
        setCurrentGameEvent(turnMessage);
      }
    }
  }, [currentEventIndex, gameStarted, activeBoard]);

  const handleGameEvent = (trigger: GameEventMessage["trigger"]) => {
    if (gameStarted) {
      // Find the message set that contains the matching trigger
      const messageSet = gameEventMessages.find((messages) =>
        messages.some((msg) => msg.trigger === trigger),
      );

      if (messageSet) {
        // Find the specific message for this trigger and active board
        const message = messageSet.find((msg) => {
          return msg.trigger === trigger && msg.active !== activeBoard;
        });

        if (message) {
          console.log(message);
          setCurrentGameEvent({
            player: message.player,
            bot: message.bot,
            trigger: trigger,
            active: message.active,
          });
        }
      }
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-evenly">
      <DetailsBox />
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
              onGameEvent: handleGameEvent,
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
              onGameEvent: handleGameEvent,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <ChatBox
          gameStarted={gameStarted}
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          onGameEvent={handleGameEvent}
          currentEvent={currentGameEvent!}
        />
      </div>
    </div>
  );
};
