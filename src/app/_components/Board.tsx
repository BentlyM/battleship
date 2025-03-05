"use client";
import React, { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import ShipHead from "./ship/ShipHead";
import ShipBody from "./ship/ShipBody";
import ShipTail from "./ship/ShipTail";
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
} from "~/types/game";
import TargetPointer from "./TargetPointer";
import { handlePlayerAttack } from "../helpers/attackHelpers";
import { motion, stagger, animate, useInView } from "framer-motion";
import Fleet from "./Fleet";
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
  };
  onClick?: () => void;
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
    if (id === "bot-board") {
      handleAutoPlace(
        boardData,
        placedShips || {},
        setPlacedShips,
        setBoardData,
        setShipCount,
      );
    }
  }, [id]);

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

            if (targetCell === "hit" || targetCell === "miss") {
              setReTarget(true);
              setBotTargeting(true);
              steps = 0;
              maxSteps = baseSteps + consecutiveHits * 2;
              return moveTarget();
            }

            if (targetCell && targetCell !== "hit" && targetCell !== "miss") {
              setBoardData((prevBoard) =>
                prevBoard.map((row, y) =>
                  row.map((cell, x) =>
                    x === finalX && y === finalY ? "hit" : cell,
                  ),
                ),
              );
              handleAttackResult(true);
              consecutiveHits++;
              steps = 0;
              maxSteps = baseSteps + consecutiveHits * 2;
              setBotTargeting(true);
              return moveTarget();
            } else {
              setBoardData((prevBoard: BoardType): BoardType => {
                return prevBoard.map((row, y) =>
                  row.map((cell, x) =>
                    x === finalX && y === finalY ? "miss" : cell,
                  ),
                );
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
    if (isInView && tableRef.current) {
      animate("h3", { opacity: 1, y: [20, 0] }, { duration: 0.5 });

      animate(
        "th:not(:first-child)",
        { opacity: 1, y: [20, 0] },
        {
          delay: stagger(0.05),
          duration: 0.3,
        },
      );

      animate(
        "th:first-child",
        { opacity: 1, y: [20, 0] },
        {
          delay: stagger(0.05),
          duration: 0.3,
        },
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
  }, [isInView]);

  return (
    <div
      className="mx-auto flex w-full max-w-[600px] flex-col items-center p-4"
      onDragStart={(e) => handleDragStart(e, setDraggedShip)}
      onDragEnd={() => handleDragEnd(setDraggedShip)}
    >
      <h3 className="mb-6 text-center text-xl font-semibold opacity-0">
        {id === "player-board" ? "Player Board" : "Bot Board"}
      </h3>
      <div className="aspect-square w-full">
        <div className="relative overflow-hidden" ref={tableContainerRef}>
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
              id === "bot-board" && gameStarted
                ? (e) =>
                    handlePlayerAttack(
                      e,
                      boardData,
                      setBoardData,
                      setActiveBoard,
                      handleAttackResult,
                    )
                : undefined
            }
          >
            <tbody className="board" id={id}>
              <tr>
                <th className="h-8 w-8 sm:h-10 sm:w-10"></th>
                {columnHeaders.map((header, index) => (
                  <th
                    key={index}
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black" : "text-transparent"} opacity-0 transition-colors duration-300`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
              {boardData.map((row: BoardType[number], rowIndex: number) => (
                <tr key={rowIndex}>
                  <th
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black" : "text-transparent"} opacity-0 transition-colors duration-300`}
                  >
                    {rowIndex + 1}
                  </th>
                  {row.map(
                    (cell: BoardType[number][number], columnIndex: number) => {
                      // Calculate highlight area
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
                          ? "bg-board-cell"
                          : "cursor-pointer bg-gray-200 hover:bg-board-cell-hover";

                      return (
                        <motion.td
                          initial={{ opacity: 0 }}
                          key={columnIndex}
                          data-x={columnIndex}
                          data-y={rowIndex}
                          className={`h-8 w-8 rounded-sm sm:h-10 sm:w-10 ${cellClass} ${
                            isHighlighted
                              ? isValid
                                ? "bg-green-200"
                                : "bg-red-200"
                              : ""
                          } ${cell === "hit" ? "bg-red-600" : ""} relative transition-colors duration-200`}
                        >
                          {cell && renderShipPart(cell)}
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
        />
      )}
    </div>
  );
};

export { Board };
