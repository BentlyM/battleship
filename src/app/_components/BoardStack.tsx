// src/components/BoardStack.tsx
"use client";
import { useEffect, useState } from "react";
import { Board } from "./Board";
import type {
  Board as BoardType,
  GameEventMessage,
  ShipType,
  Stats,
} from "~/types/game";
import ChatBox from "./ChatBox";
import DetailsBox from "./DetailsBox";
import { gameEventMessages, prologueMessages } from "../helpers/chatHelpers";
import { login } from "./_actions/login";

export const BOARD_SIZE = 10;
export const createBoard = (): BoardType =>
  Array.from(
    { length: BOARD_SIZE },
    (): string[] => Array(BOARD_SIZE).fill("") as string[],
  ) as BoardType;

export const BoardStack = () => {
  const [initialScreenIsDesktop, setInitialScreenIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );
  const [activeBoard, setActiveBoard] = useState<"player" | "bot">("player");
  const [playerBoard, setPlayerBoard] = useState<BoardType>(createBoard());
  const [botBoard, setBotBoard] = useState<BoardType>(createBoard());
  const [gameStarted, setGameStarted] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentGameEvent, setCurrentGameEvent] = useState(prologueMessages[0]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [sunkShips, setSunkShips] = useState<Record<ShipType, boolean>>({
    carrier: false,
    battleship: false,
    cruiser: false,
    submarine: false,
    destroyer: false,
  });
  const [currentStats, setCurrentStats] = useState<Stats>({
    accuracy: 0,
    sunkShips: 0,
    shots: 0,
    time: "",
    gameOutcome: undefined,
  });

  useEffect(() => {
    if (!gameStarted) {
      const timer = setInterval(() => {
        setCurrentEventIndex((prev) =>
          Math.min(prev + 1, prologueMessages.length - 1),
        );
      }, 3000);

      if (isGameOver) {
        setCurrentEventIndex(0);
        clearInterval(timer);
      }

      return () => clearInterval(timer);
    }
  }, [gameStarted, isGameOver]);

  useEffect(() => {
    if (!gameStarted) {
      setCurrentGameEvent(prologueMessages[currentEventIndex]);
    } else {
      const turnMessage = gameEventMessages[0]?.find(
        (msg) => msg.trigger === "turn" && msg.active !== activeBoard,
      );
      if (turnMessage && currentGameEvent?.trigger !== "miss") {
        setCurrentGameEvent(turnMessage);
      }
    }
  }, [currentEventIndex, gameStarted, activeBoard]);

  const handleGameEvent = (trigger: GameEventMessage["trigger"]) => {
    if (gameStarted) {
      const messageSet = gameEventMessages.find((messages) =>
        messages.some((msg) => msg.trigger === trigger),
      );

      if (messageSet) {
        const message = messageSet.find((msg) => {
          return msg.trigger === trigger && msg.active !== activeBoard;
        });

        if (message) {
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

  const checkForWinner = (boardData: BoardType) => {
    const shipTypes: ShipType[] = [
      "carrier",
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
    ];
    const shipSizes: Record<ShipType, number> = {
      carrier: 5,
      battleship: 4,
      cruiser: 3,
      submarine: 3,
      destroyer: 2,
    };

    const allShipsSunk = shipTypes.every((shipType) => {
      const shipSize = shipSizes[shipType];
      const hitCount = boardData
        .flat()
        .filter((cell) => cell?.startsWith(`${shipType}-hit`)).length;
      return hitCount === shipSize;
    });

    if (allShipsSunk) {
      setGameStarted(false);
      setCurrentStats({
        accuracy: 0,
        sunkShips: 0,
        shots: 0,
        time: "",
        gameOutcome: undefined,
      });
    }

    return allShipsSunk;
  };

  return (
    <div className="relative flex h-full w-full flex-col-reverse items-center justify-evenly lg:flex-row dark:bg-[#080808]">
      <DetailsBox
        props={{
          gameStarted,
          isGameOver,
          currentStats,
          setCurrentStats,
        }}
      />
      <div className="relative flex h-full w-[90vw] max-w-[388px] justify-center sm:max-w-[545px]">
        {/* Player Board */}
        <div
          className={`absolute left-1/2 top-1/2 transition-all duration-500 ease-in-out ${activeBoard === "player" ? "visible" : "invisible md:visible"} ${
            activeBoard === "player"
              ? "z-30 -translate-x-1/2 -translate-y-1/2"
              : "z-20 -translate-y-[70%] translate-x-[100%] opacity-75 md:-translate-x-[36%] md:-translate-y-[54%] lg:-translate-x-[45%] lg:-translate-y-[47%]"
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
              setIsGameOver: setIsGameOver,
              checkForWinner,
              sunkShips,
              setSunkShips,
              setCurrentStats,
              isGameOver,
              initialScreenIsDesktop,
            }}
          />
        </div>

        {/* Bot Board */}
        <div
          className={`absolute left-1/2 top-1/2 transition-all duration-500 ease-in-out ${activeBoard === "bot" ? "visible" : "invisible md:visible"} ${
            activeBoard === "bot"
              ? "z-30 -translate-x-1/2 -translate-y-[58%] md:-translate-y-[50%] lg:-translate-x-1/2 lg:-translate-y-[72%]"
              : "z-20 -translate-x-[200%] -translate-y-[70%] opacity-75 md:-translate-x-[37%] md:-translate-y-[55%] lg:-translate-x-[45%] lg:-translate-y-[67%]"
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
              setIsGameOver: setIsGameOver,
              checkForWinner,
              sunkShips,
              setSunkShips,
              setCurrentStats,
              isGameOver,
              initialScreenIsDesktop,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <ChatBox
          gameStarted={gameStarted}
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          currentEvent={currentGameEvent!}
          sunkShips={sunkShips}
        />
      </div>
    </div>
  );
};
