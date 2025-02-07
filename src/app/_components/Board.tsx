"use client";
import React from "react";
import Ship, { shipProps } from "./Ship";
import { Button } from "~/components/ui/button";
import ShipHead from './ship/ShipHead';
import ShipBody from './ship/ShipBody';
import ShipTail from './ship/ShipTail';
import { Board as BoardType } from "./BoardStack";
interface BoardProps {
  board: {
    id: string;
    boardData: BoardType;
    activeBoard: "player" | "bot";
    setBoardData: (boardData: BoardType) => void;
  };
  onClick?: () => void;
}

const Board: React.FC<BoardProps> = ({ board, onClick }) => {
  const { id, boardData, activeBoard }: BoardProps["board"] = board;
  const [draggedShip, setDraggedShip] = React.useState<{
    type: string;
    size: number;
    orientation: "horizontal" | "vertical";
    x: number;
    y: number;
  } | null>(null);
  const [placedShips, setPlacedShips] = React.useState<{
    [key: string]: {
      type: string;
      size: number;
      orientation: "horizontal" | "vertical";
      x: number;
      y: number;
    };
  }>({});
  const [shipCount, setShipCount] = React.useState<{
    [key: string]: number;
  }>({});
  const isActive =
    (id === "player-board" && activeBoard === "player") ||
    (id === "bot-board" && activeBoard === "bot");

  // Column headers for the game board (A to J)
  const columnHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  const handleDragStart = (e: React.DragEvent) => {
    const shipDataStr = e.dataTransfer.getData("application/json");
    if (shipDataStr) {
      const shipData = JSON.parse(shipDataStr);
      setDraggedShip({ ...shipData, x: -1, y: -1 });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedShip) return;

    const target = e.target as HTMLElement;
    const table = target.closest("table");
    if (!table) return;

    const rect = table.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellSize = 32;
    const borderSpacing = 3;

    // Snap to grid calculation
    const x = Math.floor(mouseX / (cellSize + borderSpacing)) - 1;
    const y = Math.floor(mouseY / (cellSize + borderSpacing)) - 1;

    // Adjust position based on orientation and size to keep highlight centered
    const adjustedX =
      draggedShip.orientation === "horizontal"
        ? Math.max(0, Math.min(x, boardData.length - draggedShip.size))
        : Math.max(0, Math.min(x, boardData.length - 1));

    const adjustedY =
      draggedShip.orientation === "vertical"
        ? Math.max(0, Math.min(y, boardData[0]!.length - draggedShip.size))
        : Math.max(0, Math.min(y, boardData[0]!.length - 1));

    if (adjustedX !== draggedShip.x || adjustedY !== draggedShip.y) {
      setDraggedShip((prev) =>
        prev ? { ...prev, x: adjustedX, y: adjustedY } : null,
      );
    }
  };

  const handleDragEnd = () => {
    setDraggedShip(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableElement>) => {
    e.preventDefault();
  };

  const isPlacementValid = (
    x: number,
    y: number,
    size: number,
    orientation: "horizontal" | "vertical",
    shipType?: string
  ): boolean => {
    // Check boundaries
    if (orientation === "horizontal" && x + size > boardData[0]!.length) return false;
    if (orientation === "vertical" && y + size > boardData.length) return false;

    // Check for collisions with other ships and adjacent cells
    for (let row = Math.max(0, y - 1); row <= Math.min(boardData.length - 1, y + (orientation === "vertical" ? size : 1)); row++) {
      for (let col = Math.max(0, x - 1); col <= Math.min(boardData[0]!.length - 1, x + (orientation === "horizontal" ? size : 1)); col++) {
        const cell = boardData[row]![col];
        if (cell) {
          const [existingShipType] = cell.split('-');
          // Allow overlap with the same ship (for repositioning)
          if (shipType && existingShipType === shipType) continue;
          return false;
        }
      }
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();

    try {
      const target = e.target as HTMLElement;
      const table = target.closest("table");
      if (!table) return;

      const rect = table.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cellSize = 32;
      const borderSpacing = 3;

      const x = Math.floor(mouseX / (cellSize + borderSpacing)) - 1;
      const y = Math.floor(mouseY / (cellSize + borderSpacing)) - 1;

      const adjustedX =
        draggedShip?.orientation === "horizontal"
          ? Math.max(0, Math.min(x, boardData.length - draggedShip.size))
          : Math.max(0, Math.min(x, boardData.length - 1));

      const adjustedY =
        draggedShip?.orientation === "vertical"
          ? Math.max(0, Math.min(y, boardData[0]!.length - draggedShip.size))
          : Math.max(0, Math.min(y, boardData[0]!.length - 1));

      if (
        adjustedX < 0 ||
        adjustedX >= boardData.length ||
        adjustedY < 0 ||
        adjustedY >= boardData[0]!.length
      ) {
        return;
      }

      const shipDataStr = e.dataTransfer.getData("application/json");
      if (!shipDataStr) return;

      const shipData = JSON.parse(shipDataStr) as {
        type: string;
        size: number;
        orientation: "horizontal" | "vertical";
      };

      if (id === "player-board") {
        // Remove existing ship of same type if it exists
        if (placedShips[shipData.type]) {
          const oldShip = placedShips[shipData.type]!;
          if (oldShip.orientation === "horizontal") {
            for (let i = 0; i < oldShip.size; i++) {
              boardData[oldShip.y]![oldShip.x + i] = "";
            }
          } else {
            for (let i = 0; i < oldShip.size; i++) {
              boardData[oldShip.y + i]![oldShip.x] = "";
            }
          }
        }

        if (isPlacementValid(adjustedX, adjustedY, shipData.size, shipData.orientation, shipData.type)) {
          // Place the ship
          if (shipData.orientation === "horizontal") {
            for (let i = 0; i < shipData.size; i++) {
              boardData[adjustedY]![adjustedX + i] = `${shipData.type}-${i}`;
            }
          } else {
            for (let i = 0; i < shipData.size; i++) {
              boardData[adjustedY + i]![adjustedX] = `${shipData.type}-${i}`;
            }
          }

          // Update placed ships
          setPlacedShips(prev => ({
            ...prev,
            [shipData.type]: {
              ...shipData,
              x: adjustedX,
              y: adjustedY
            }
          }));
        }
      }
    } catch (error) {
      console.error("Error handling ship drop:", error);
    }
  };

  const renderShipPart = (cell: string) => {
    if (!cell) return null;

    const [shipType, partIndex] = cell.split('-');
    if (!shipType || !partIndex) return null;

    const ship = placedShips[shipType];
    if (!ship) return null;

    const index = parseInt(partIndex);
    if (isNaN(index)) return null;
    
    if (index === 0) {
      return <ShipHead orientation={ship.orientation} />;
    } else if (index === ship.size - 1) {
      return <ShipTail orientation={ship.orientation} />;
    } else {
      return <ShipBody index={index} />;
    }
  };

  return (
    <div
      className="mx-auto flex w-full max-w-[600px] flex-col items-center p-4"
      onClick={onClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h3 className="mb-6 text-center text-xl font-semibold">
        {id === "player-board" ? "Player Board" : "Bot Board"}
      </h3>
      <div className="aspect-square w-full">
        <div className="overflow-x-auto">
          <table
            className="w-full table-fixed border-separate border-spacing-[3px]"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
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
                    {row.map((cell: BoardType[number][number], columnIndex: number) => {
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
                        draggedShip!.type
                      );

                    const cellClass =
                      id === "player-board"
                        ? "bg-board-cell"
                        : "cursor-pointer bg-gray-200 hover:bg-board-cell-hover";

                    return (
                      <td
                        key={columnIndex}
                        className={`h-8 w-8 rounded-sm sm:h-10 sm:w-10 ${cellClass} ${
                          isHighlighted
                            ? isValid
                              ? "bg-green-200"
                              : "bg-red-200"
                            : ""
                        } transition-colors duration-200 relative`}
                      >
                        {cell && renderShipPart(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ships section - only show for player board */}
      {id === "player-board" && (
        <div className="w-full rounded-lg border-2 border-gray-200 p-4">
          <div className="flex flex-row gap-4">
          <h4 className="mb-4 text-lg font-semibold">Ships</h4>
            <Button variant="outline" className="h-8 rounded-full px-3 text-sm">
              Auto-place Ships
            </Button>
            <Button variant="outline" className="h-8 rounded-full px-3 text-sm">
              Remove Ships
            </Button>
            <Button variant="outline" className="h-8 rounded-full px-3 text-sm bg-green-500 text-white hover:bg-green-600">Start Game</Button>
          </div>
          <div className="flex h-[176px] w-[440px] flex-wrap justify-center gap-4 overflow-auto">
            {Object.entries(shipProps).map(([type, props]) => (
              <Ship
                key={type}
                type={type}
                size={props.size}
                orientation={props.orientation}
                active={isActive}
                count={shipCount[type] || 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Board };

