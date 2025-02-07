"use client";
import React from "react";
import Ship, { shipProps } from "./Ship";

interface BoardProps {
  board: {
    id: string;
    boardData: string[][];
    activeBoard: "player" | "bot";
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
  ) => {
    if (orientation === "horizontal") {
      if (x + size > boardData.length) {
        return false;
      }
      for (let i = 0; i < size; i++) {
        if (boardData[y]![x + i] !== "") {
          return false;
        }
      }
      return true;
    } else {
      if (y + size > boardData[0]!.length) {
        return false;
      }
      for (let i = 0; i < size; i++) {
        if (boardData[y + i]![x] !== "") {
          return false;
        }
      }
      return true;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();

    try {
      const target = e.target as HTMLElement;
      const table = target.closest("table");
      if (!table) return;

      // Get the mouse position relative to the table
      const rect = table.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate cell size (including border spacing)
      const cellSize = 32; // 32px for w-8 h-8, or 40px for sm:w-10 sm:h-10
      const borderSpacing = 3; // From border-spacing-[3px]

      // Calculate the nearest grid cell (same as handleDragOver)
      const x = Math.floor(mouseX / (cellSize + borderSpacing)) - 1; // -1 for header column
      const y = Math.floor(mouseY / (cellSize + borderSpacing)) - 1; // -1 for header row

      // Use the same adjustment logic as handleDragOver
      const adjustedX =
        draggedShip?.orientation === "horizontal"
          ? Math.max(0, Math.min(x, boardData.length - draggedShip.size))
          : Math.max(0, Math.min(x, boardData.length - 1));

      const adjustedY =
        draggedShip?.orientation === "vertical"
          ? Math.max(0, Math.min(y, boardData[0]!.length - draggedShip.size))
          : Math.max(0, Math.min(y, boardData[0]!.length - 1));

      // Validate the position
      if (
        adjustedX < 0 ||
        adjustedX >= boardData.length ||
        adjustedY < 0 ||
        adjustedY >= boardData[0]!.length
      ) {
        console.error("Invalid drop position");
        return;
      }

      const shipDataStr = e.dataTransfer.getData("application/json");
      if (!shipDataStr) {
        console.error("No ship data received");
        return;
      }

      const shipData = JSON.parse(shipDataStr);

      // Use the adjusted position for the drop
      console.log("Ship dropped at:", {
        ...shipData,
        x: adjustedX,
        y: adjustedY,
        orientation: draggedShip?.orientation || shipData.orientation,
      });

      if (id === "player-board") {
        if (
          isPlacementValid(
            adjustedX,
            adjustedY,
            shipData.size,
            shipData.orientation,
          )
        ) {
          // Place the ship on the board
          if (shipData.orientation === "horizontal") {
            for (let i = 0; i < shipData.size; i++) {
              if (boardData[adjustedY]![adjustedX + i] === "") {
                boardData[adjustedY]![adjustedX + i] = shipData.type;
              } else {
                throw new Error("Invalid placement");
              }
            }
          } else {
            for (let i = 0; i < shipData.size; i++) {
              if (boardData[adjustedY + i]![adjustedX] === "") {
                boardData[adjustedY + i]![adjustedX] = shipData.type;
              } else {
                throw new Error("Invalid placement");
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error handling ship drop:", error);
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
              {boardData.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  <th
                    className={`h-8 w-8 text-center text-sm sm:h-10 sm:w-10 sm:text-base ${isActive ? "text-black" : "text-transparent"} transition-colors duration-300`}
                  >
                    {rowIndex + 1}
                  </th>
                  {row.map((_, columnIndex: number) => {
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
                        } transition-colors duration-200`}
                      />
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
          <h4 className="mb-4 text-lg font-semibold">Your Ships</h4>
          <div className="flex h-[176px] w-[440px] flex-wrap justify-center gap-4 overflow-auto">
            {Object.entries(shipProps).map(([type, props]) => (
              <Ship
                key={type}
                type={type}
                size={props.size}
                orientation={props.orientation}
                active={isActive}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Board };
