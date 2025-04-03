"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import ShipHead, { AttackedShipHead } from "./ship/ShipHead";
import ShipBody, { AttackedShipBody } from "./ship/ShipBody";
import ShipTail, { AttackedShipTail } from "./ship/ShipTail";
import {
  handleDragEnd,
  handleDragEnter,
  handleDragOver,
  handleDragStart,
} from "../helpers/dragHelpers";
import {
  handleAutoPlace,
  handleDrop,
  isPlacementValid,
} from "../helpers/boardHelpers";
import type {
  ShipType,
  Ship as ShipStructure,
  Board as BoardType,
  SetBoardData,
  PlacedShips,
  ShipCount,
  CheckForWinner,
  Stats,
} from "~/types/game";
import TargetPointer from "./TargetPointer";
import { handlePlayerAttack } from "../helpers/attackHelpers";
import { motion, stagger, animate, useInView } from "framer-motion";
import Fleet from "./Fleet";
import { createBoard } from "./BoardStack";
interface BoardProps {
  board: {
    id: string;
    boardData: BoardType;
    activeBoard: "player" | "bot";
    setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>;
    setBoardData: SetBoardData;
    gameStarted: boolean;
    setGameStarted: (gameStarted: boolean) => void;
    onGameEvent: (trigger: "hit" | "miss") => void;
    setIsGameOver: Dispatch<SetStateAction<boolean>>;
    checkForWinner: CheckForWinner;
    setSunkShips: Dispatch<SetStateAction<Record<ShipType, boolean>>>;
    setCurrentStats: Dispatch<SetStateAction<Stats>>;
    sunkShips: Record<ShipType, boolean>;
    isGameOver: boolean;
  };
}

const Board: React.FC<BoardProps> = ({ board }) => {
  const {
    id,
    boardData,
    activeBoard,
    setBoardData,
    gameStarted,
    setGameStarted,
    setActiveBoard,
    onGameEvent,
    setIsGameOver,
    checkForWinner,
    setSunkShips,
    setCurrentStats,
    sunkShips,
    isGameOver,
  }: BoardProps["board"] = board;
  const [draggedShip, setDraggedShip] = React.useState<ShipStructure | null>(
    null,
  );
  const [placedShips, setPlacedShips] = React.useState<PlacedShips>(
    {} as PlacedShips,
  );
  const [shipCount, setShipCount] = React.useState<ShipCount>({
    carrier: { count: 1 },
    battleship: { count: 1 },
    cruiser: { count: 1 },
    submarine: { count: 1 },
    destroyer: { count: 1 },
  });
  const [botTargeting, setBotTargeting] = React.useState(false);
  const [botTarget, setBotTarget] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [targetTransform, setTargetTransform] = React.useState({ x: 0, y: 0 });
  const [reTarget, setReTarget] = React.useState<boolean>(false);
  const [initialScreenIsDesktop, setInitialScreenIsDesktop] = useState(
    // Initialize with correct value using a function
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );
  const isActive =
    (id === "player-board" && activeBoard === "player") ||
    (id === "bot-board" && activeBoard === "bot");

  const handleAttackResult = (isHit: boolean) => {
    onGameEvent(isHit ? "hit" : "miss");
  };

  const columnHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  useEffect(() => {
    if (!botTargeting || !tableContainerRef.current) return;

    const cell = tableContainerRef.current.querySelector(
      `td[data-x="${botTarget.x}"][data-y="${botTarget.y}"]`,
    );

    if (!cell) return;

    const cellRect = cell.getBoundingClientRect();
    const containerRect = tableContainerRef.current.getBoundingClientRect();

    const x = cellRect.left - containerRect.left + cellRect.width / 2;
    const y = cellRect.top - containerRect.top + cellRect.height / 2;

    setTargetTransform({ x, y });
  }, [botTarget, botTargeting]);

  useEffect(() => {
    if (id === "bot-board" && !isGameOver) {
      handleAutoPlace(
        boardData,
        placedShips || {},
        setPlacedShips,
        setBoardData,
        setShipCount,
      );
    } else if (id === "bot-board" && isGameOver) {
      setBoardData(createBoard());
    }
  }, [id, isGameOver]);

  useEffect(() => {
    if (id === "player-board" && gameStarted && activeBoard === "player") {
      setBotTargeting(true);
      let currentPosition = {
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10),
      };
      const baseSteps = 5;
      let maxSteps = baseSteps;
      let steps = 0;
      let consecutiveHits = 0;

      const moveTarget = () => {
        if (steps >= maxSteps) {
          const finalX = Math.floor(Math.random() * 10);
          const finalY = Math.floor(Math.random() * 10);
          setBotTarget({ x: finalX, y: finalY });

          setTimeout(() => {
            const targetCell = boardData[finalY]?.[finalX];

            if (
              targetCell?.split("-").includes("hit") ||
              targetCell === "miss"
            ) {
              setReTarget(true);
              setBotTargeting(true);
              steps = 0;
              maxSteps = baseSteps + consecutiveHits * 2;
              return moveTarget();
            }

            if (targetCell && targetCell !== "hit" && targetCell !== "miss") {
              const [shipType, partIndex] = targetCell.split("-");
              if (shipType && partIndex) {
                setBoardData((prevBoard) => {
                  const newBoard = prevBoard.map((row, y) =>
                    row.map((cell, x) =>
                      x === finalX && y === finalY
                        ? `${shipType}-hit-${partIndex}`
                        : cell,
                    ),
                  );
                  if (checkForWinner(newBoard)) {
                    console.log("Bot won");
                    setCurrentStats((prev) => ({
                      ...prev,
                      gameOutcome: "lose",
                    }));
                    setIsGameOver(true);
                  }
                  return newBoard;
                });
              }
              handleAttackResult(true);
              consecutiveHits++;
              steps = 0;
              maxSteps = baseSteps + consecutiveHits * 2;
              setBotTargeting(true);
              return moveTarget();
            } else {
              setBoardData((prevBoard: BoardType): BoardType => {
                const newBoard = prevBoard.map((row, y) =>
                  row.map((cell, x) =>
                    x === finalX && y === finalY ? "miss" : cell,
                  ),
                );
                return newBoard;
              });
              handleAttackResult(false);
              setActiveBoard("bot");
              setBotTargeting(false);
              consecutiveHits = 0;
            }
          }, 500);
          return;
        }

        const possibleMoves = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ];

        const validMoves = possibleMoves.filter((move) => {
          const newX = currentPosition.x + move.dx;
          const newY = currentPosition.y + move.dy;
          return newX >= 0 && newX < 10 && newY >= 0 && newY < 10;
        });

        if (validMoves.length === 0) {
          if (!reTarget) {
            currentPosition = {
              x: Math.floor(Math.random() * 10),
              y: Math.floor(Math.random() * 10),
            };
          } else {
            currentPosition = {
              x: botTarget.x,
              y: botTarget.y,
            };
          }
        } else {
          const moveIndex = Math.floor(Math.random() * validMoves.length);
          const selectedMove = validMoves[moveIndex]!;
          currentPosition = {
            x: currentPosition.x + selectedMove.dx,
            y: currentPosition.y + selectedMove.dy,
          };
        }

        setBotTarget(currentPosition);
        steps++;
        setTimeout(moveTarget, 200);
      };

      moveTarget();
    }
  }, [id, gameStarted, activeBoard]);

  const renderShipPart = (cell: string) => {
    if (!cell) return null;

    const [shipType, partIndex] = cell.split("-");
    if (!shipType || !partIndex) return null;

    const ship = placedShips[shipType as ShipType];
    if (!ship) return null;

    const index = parseInt(partIndex);
    if (isNaN(index)) return null;

    if (id === "player-board") {
      if (index === 0) {
        return <ShipHead orientation={ship.orientation} />;
      } else if (index === ship.size - 1) {
        return <ShipTail orientation={ship.orientation} />;
      } else {
        return <ShipBody index={index} />;
      }
    } else {
      return null;
    }
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const isInView = useInView(tableRef, { once: true });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    if (!isInView || !tableRef.current) return;

    // Immediately show all elements if initial load was mobile
    if (!initialScreenIsDesktop) {
      animate("td, th, h3", { opacity: 1 }, { duration: 0 });
      return;
    }

    // Handle desktop animations only if initial load was desktop
    if (mediaQuery.matches) {
      animate("h3", { opacity: 1, y: [20, 0] }, { duration: 0.5 });

      // Your desktop animation logic
      animate(
        "th:not(:first-child)",
        { opacity: 1, y: [20, 0] },
        { delay: stagger(0.05), duration: 0.3 },
      );

      animate(
        "th:first-child",
        { opacity: 1, y: [20, 0] },
        { delay: stagger(0.05), duration: 0.3 },
      );

      animate(
        "td",
        { opacity: 1, y: [50, 0] },
        {
          delay: (index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;
            return (row + col) * 0.05;
          },
        },
      );
    }
  }, [isInView, initialScreenIsDesktop]);

  return (
    <div
      className="flex w-full flex-col items-center p-1 sm:p-4"
      onDragStart={(e) => handleDragStart(e, setDraggedShip)}
      onDragEnd={() => handleDragEnd(setDraggedShip)}
    >
      <h3 className="text-center text-xl font-semibold opacity-0 md:mb-6 dark:text-white">
        {id === "player-board" ? "Player Board" : "Bot Board"}
      </h3>
      <div className="w-full">
        <div className="relative" ref={tableContainerRef}>
          {id === "player-board" && botTargeting && (
            <TargetPointer x={targetTransform.x} y={targetTransform.y} />
          )}
          <table
            ref={tableRef}
            className="w-full table-fixed border-separate border-spacing-[3px]"
            onDragOver={(e) =>
              handleDragOver(e, boardData, draggedShip, setDraggedShip)
            }
            onDragEnter={handleDragEnter}
            onDrop={(e) =>
              handleDrop(
                e,
                boardData,
                id,
                draggedShip,
                placedShips || {},
                setPlacedShips,
                setShipCount,
              )
            }
            onClick={
              activeBoard === "bot" && gameStarted && !isGameOver
                ? (e) =>
                    handlePlayerAttack(
                      e,
                      boardData,
                      setBoardData,
                      setActiveBoard,
                      handleAttackResult,
                      checkForWinner,
                      setSunkShips,
                      setIsGameOver,
                      setCurrentStats,
                      sunkShips,
                    )
                : undefined
            }
          >
            <tbody className="board" id={id}>
              <tr>
                <th className="h-4 w-4 sm:h-10 sm:w-10"></th>
                {columnHeaders.map((header, index) => (
                  <th
                    key={index}
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black dark:text-white" : "text-transparent"} opacity-0 transition-colors duration-300`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
              {boardData.map((row: BoardType[number], rowIndex: number) => (
                <tr key={rowIndex}>
                  <th
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black dark:text-white" : "text-transparent"} opacity-0 transition-colors duration-300`}
                  >
                    {rowIndex + 1}
                  </th>
                  {row.map(
                    (cell: BoardType[number][number], columnIndex: number) => {
                      const isHighlighted =
                        draggedShip &&
                        ((draggedShip.orientation === "horizontal" &&
                          columnIndex >= draggedShip.x &&
                          columnIndex < draggedShip.x + draggedShip.size &&
                          rowIndex === draggedShip.y) ||
                          (draggedShip.orientation === "vertical" &&
                            rowIndex >= draggedShip.y &&
                            rowIndex < draggedShip.y + draggedShip.size &&
                            columnIndex === draggedShip.x));

                      const isValid =
                        isHighlighted &&
                        isPlacementValid(
                          draggedShip.x,
                          draggedShip.y,
                          draggedShip.size,
                          draggedShip.orientation,
                          boardData,
                          draggedShip.type,
                        );

                      const cellClass =
                        id === "player-board"
                          ? "bg-board-cell dark:bg-gray-700"
                          : "cursor-pointer bg-gray-200 hover:bg-board-cell-hover dark:bg-gray-700 dark:hover:bg-board-cell-hover";

                      return (
                        <motion.td
                          initial={{ opacity: 0 }}
                          key={columnIndex}
                          data-x={columnIndex}
                          data-y={rowIndex}
                          className={`h-8 w-8 rounded-sm sm:h-10 sm:w-10 ${cellClass} ${
                            isHighlighted
                              ? isValid
                                ? "bg-green-200 dark:bg-green-700"
                                : "bg-red-200 dark:bg-red-700"
                              : ""
                          } relative transition-colors duration-200`}
                        >
                          <div className="flex items-center justify-center">
                            {cell === "miss" &&
                              (id !== "bot-board" ? (
                                <div className="size-4 rounded-[50px] bg-sky-700 opacity-30 dark:bg-sky-600"></div>
                              ) : (
                                <div className="size-4 rounded-[50px] bg-gray-700 opacity-30 dark:bg-gray-400"></div>
                              ))}
                            {cell && renderShipPart(cell)}
                            {cell.split("-").includes("hit") &&
                              (id !== "bot-board" ? (
                                parseInt(cell.split("-")[2]!) === 0 ? (
                                  <AttackedShipHead
                                    orientation={
                                      placedShips[
                                        cell.split("-")[0] as ShipType
                                      ]?.orientation || "horizontal"
                                    }
                                  />
                                ) : parseInt(cell.split("-")[2]!) ===
                                  placedShips[cell.split("-")[0] as ShipType]
                                    ?.size -
                                    1 ? (
                                  <AttackedShipTail
                                    orientation={
                                      placedShips[
                                        cell.split("-")[0] as ShipType
                                      ]?.orientation || "horizontal"
                                    }
                                  />
                                ) : (
                                  <AttackedShipBody
                                    index={parseInt(cell.split("-")[2]!)}
                                  />
                                )
                              ) : (
                                <div className="size-4 rounded-[50px] bg-red-500 opacity-80"></div>
                              ))}
                          </div>
                        </motion.td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {id === "player-board" && (
        <Fleet
          placedShips={placedShips}
          setGameStarted={setGameStarted}
          setShipCount={setShipCount}
          boardData={boardData}
          handleAutoPlace={handleAutoPlace}
          setPlacedShips={setPlacedShips}
          setBoardData={setBoardData}
          gameStarted={gameStarted}
          shipCount={shipCount}
          isActive={isActive}
          setIsGameOver={setIsGameOver}
          isGameOver={isGameOver}
        />
      )}
    </div>
  );
};

export { Board };
