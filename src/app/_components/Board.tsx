"use client";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import Ship, { shipProps } from "./Ship";
import { Button } from "~/components/ui/button";
import ShipHead from "./ship/ShipHead";
import ShipBody from "./ship/ShipBody";
import ShipTail from "./ship/ShipTail";
import { Board as BoardType } from "./BoardStack";
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
import { ShipType, Ship as ShipStructure } from "~/types/game";
import TargetPointer from "./TargetPointer";
import { handlePlayerAttack } from "../helpers/attackHelpers";
interface BoardProps {
  board: {
    id: string;
    boardData: BoardType;
    activeBoard: "player" | "bot";
    setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>;
    setBoardData: (boardData: BoardType) => void;
    gameStarted: boolean;
    setGameStarted: (gameStarted: boolean) => void;
  };
  onClick?: () => void;
}

const Board: React.FC<BoardProps> = ({ board, onClick }) => {
  const {
    id,
    boardData,
    activeBoard,
    setBoardData,
    gameStarted,
    setGameStarted,
    setActiveBoard,
  }: BoardProps["board"] = board;
  const [draggedShip, setDraggedShip] = React.useState<ShipStructure | null>(
    null,
  );
  const [placedShips, setPlacedShips] = React.useState<{
    [key: string]: ShipStructure;
  }>({});
  const [shipCount, setShipCount] = React.useState<{
    [key in ShipType]: { count: number };
  }>({
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

  // Column headers for the game board (A to J)
  const columnHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  useEffect(() => {
    if (!botTargeting || !tableContainerRef.current) return;

    const cell = tableContainerRef.current.querySelector(
      `td[data-x="${botTarget.x}"][data-y="${botTarget.y}"]`,
    ) as HTMLTableCellElement | null;

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
        placedShips,
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
      let baseSteps = 5; // Base number of steps
      let maxSteps = baseSteps;
      let steps = 0;
      let consecutiveHits = 0;

      const moveTarget = () => {
        if (steps >= maxSteps) {
          // Final target selection
          const finalX = Math.floor(Math.random() * 10);
          const finalY = Math.floor(Math.random() * 10);
          setBotTarget({ x: finalX, y: finalY });

          setTimeout(() => {
            const targetCell = boardData[finalY]?.[finalX];

            // If cell is already hit or missed, retarget
            if (targetCell === "hit" || targetCell === "miss") {
              setReTarget(true);
              setBotTargeting(true);
              steps = 0;
              maxSteps = baseSteps + consecutiveHits * 2; // Increase steps based on consecutive hits
              return moveTarget();
            }

            // If cell contains a ship part
            if (targetCell && targetCell !== "hit" && targetCell !== "miss") {
              setBoardData((prevBoard) =>
                prevBoard.map((row, y) =>
                  row.map((cell, x) =>
                    x === finalX && y === finalY ? "hit" : cell,
                  ),
                ),
              );
              consecutiveHits++;
              steps = 0;
              maxSteps = baseSteps + consecutiveHits * 2; // Increase steps for next search
              setBotTargeting(true);
              return moveTarget();
            } else {
              setBoardData((prevBoard) =>
                prevBoard.map((row, y) =>
                  row.map((cell, x) =>
                    x === finalX && y === finalY ? "miss" : cell,
                  ),
                ),
              );
              // Switch to player's turn only on a miss
              setActiveBoard("bot");
              setBotTargeting(false);
              consecutiveHits = 0; // Reset consecutive hits counter
            }
          }, 500);
          return;
        }
        console.log(`Steps: ${steps} compared to maxSteps: ${maxSteps} `);

        // Random movement to adjacent cell
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

    const ship = placedShips[shipType];
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

  const handleStartGame = () => {
    if (Object.values(shipCount).every((ship) => ship.count === 0)) {
      setGameStarted(true);
    } else {
      alert("Please place all ships before starting the game");
      return;
    }
  };

  return (
    <div
      className="mx-auto flex w-full max-w-[600px] flex-col items-center p-4"
      onClick={onClick}
      onDragStart={(e) => handleDragStart(e, setDraggedShip)}
      onDragEnd={() => handleDragEnd(setDraggedShip)}
    >
      <h3 className="mb-6 text-center text-xl font-semibold">
        {id === "player-board" ? "Player Board" : "Bot Board"}
      </h3>
      <div className="aspect-square w-full">
        <div className="relative overflow-x-auto" ref={tableContainerRef}>
          {id === "player-board" && botTargeting && (
            <div
              className="pointer-events-none absolute transition-[transform] duration-200 ease-in-out"
              style={{
                transform: `translate(${targetTransform.x}px, ${targetTransform.y}px)`,
                willChange: "transform",
                zIndex: 1,
              }}
            >
              <TargetPointer x={botTarget.x} y={botTarget.y} />
            </div>
          )}
          <table
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
                draggedShip as ShipStructure | null,
                placedShips,
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
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black" : "text-transparent"} transition-colors duration-300`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
              {boardData.map((row: BoardType[number], rowIndex: number) => (
                <tr key={rowIndex}>
                  <th
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black" : "text-transparent"} transition-colors duration-300`}
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
                          draggedShip!.x,
                          draggedShip!.y,
                          draggedShip!.size,
                          draggedShip!.orientation,
                          boardData,
                          draggedShip!.type as ShipType | undefined,
                        );

                      const cellClass =
                        id === "player-board"
                          ? "bg-board-cell"
                          : "cursor-pointer bg-gray-200 hover:bg-board-cell-hover";

                      return (
                        <td
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
                        </td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ships section - only show for player board */}
      {id === "player-board" && (
        <div
          className={`w-full rounded-lg border-2 border-gray-200 p-4 ${gameStarted && "mb-[176px]"}`}
        >
          <div className="flex flex-row gap-4">
            <h4 className="mb-4 text-lg font-semibold">Ships</h4>
            <Button
              variant="outline"
              className="h-8 rounded-full px-3 text-sm"
              onClick={() =>
                handleAutoPlace(
                  boardData,
                  placedShips,
                  setPlacedShips,
                  setBoardData,
                  setShipCount,
                )
              }
              disabled={!isActive || gameStarted}
            >
              Auto-place Ships
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded-full px-3 text-sm"
              onClick={() => {
                setPlacedShips({});
                setShipCount({
                  ...shipCount,
                  carrier: { count: 1 },
                  battleship: { count: 1 },
                  cruiser: { count: 1 },
                  submarine: { count: 1 },
                  destroyer: { count: 1 },
                });
                setBoardData(
                  Array.from({ length: 10 }, () => Array(10).fill("")),
                );
              }}
              disabled={!isActive || gameStarted}
            >
              Remove Ships
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded-full bg-green-500 px-3 text-sm text-white hover:bg-green-600"
              onClick={handleStartGame}
              disabled={gameStarted}
            >
              Start Game
            </Button>
          </div>
          <div
            className={`flex flex-wrap justify-center gap-4 overflow-hidden transition-all duration-300 ${gameStarted ? "h-0 opacity-0" : "h-[176px] opacity-100"}`}
          >
            {!gameStarted &&
              Object.entries(shipProps).map(([type, props]) => (
                <Ship
                  key={type}
                  type={type}
                  size={props.size}
                  orientation={props.orientation}
                  active={isActive}
                  count={shipCount[type as keyof typeof shipCount]?.count || 0}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Board };
