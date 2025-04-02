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
    <div className="flex items-center justify-evenly dark:bg-[#080808]">
      {/* <DetailsBox
        props={{
          gameStarted,
          isGameOver,
          currentStats,
          setCurrentStats,
        }}
      /> */}
      <div className="relative w-[90vw] max-w-[388px] sm:max-w-[545px]">
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
              setIsGameOver: setIsGameOver,
              checkForWinner,
              sunkShips,
              setSunkShips,
              setCurrentStats,
              isGameOver,
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
              setIsGameOver: setIsGameOver,
              checkForWinner,
              sunkShips,
              setSunkShips,
              setCurrentStats,
              isGameOver,
            }}
          />
        </div>
      </div>
      {/* <div className="flex flex-col gap-4">
        <div>
        </div>
         <ChatBox
          gameStarted={gameStarted}
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          currentEvent={currentGameEvent!}
          sunkShips={sunkShips}
        /> 
      </div> */}
    </div>
  );
};
