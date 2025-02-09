import { Board as BoardType } from "../BoardStack";
import { shipProps } from "../Ship";

export const isPlacementValid = (
    x: number,
    y: number,
    size: number,
    orientation: "horizontal" | "vertical",
    boardToCheck: BoardType,
    shipType: string | undefined,
  ): boolean => {
    const currentBoard = boardToCheck;
    // Check boundaries
    if (orientation === "horizontal" && x + size > currentBoard[0]!.length) return false;
    if (orientation === "vertical" && y + size > currentBoard.length) return false;

    // Check for collisions with other ships and adjacent cells
    for (let row = Math.max(0, y - 1); row <= Math.min(currentBoard.length - 1, y + (orientation === "vertical" ? size : 1)); row++) {
      for (let col = Math.max(0, x - 1); col <= Math.min(currentBoard[0]!.length - 1, x + (orientation === "horizontal" ? size : 1)); col++) {
        const cell = currentBoard[row]![col];
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


  export const handleAutoPlace = (boardData: BoardType, placedShips: Record<string, { size: number; orientation: "horizontal" | "vertical"; count: number; x: number; y: number }>, setPlacedShips: (ships: Record<string, { size: number; orientation: "horizontal" | "vertical"; count: number; x: number; y: number }>) => void, setBoardData: (board: BoardType) => void, setShipCount: (count: Record<string, { count: number }>) => void) => {
    const newBoardData = boardData.map(row => [...row]);
    const newPlacedShips = { ...placedShips };

    Object.entries(shipProps).forEach(([shipType, { size }]) => {
      // Remove existing ship of the same type
      const existingShip = newPlacedShips[shipType];
      if (existingShip) {
        if (existingShip.orientation === "horizontal") {
          for (let i = 0; i < existingShip.size; i++) {
            newBoardData[existingShip.y]![existingShip.x + i] = "";
          }
        } else {
          for (let i = 0; i < existingShip.size; i++) {
            newBoardData[existingShip.y + i]![existingShip.x] = "";
          }
        }
        delete newPlacedShips[shipType];
      }

      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const orientation: "horizontal" | "vertical" = Math.random() < 0.5 ? "horizontal" : "vertical";
        let x: number, y: number;

        if (orientation === "horizontal") {
          x = Math.floor(Math.random() * (10 - size));
          y = Math.floor(Math.random() * 10);
        } else {
          x = Math.floor(Math.random() * 10);
          y = Math.floor(Math.random() * (10 - size));
        }

        if (isPlacementValid(x, y, size, orientation, newBoardData, shipType)) {
          // Place the ship on newBoardData
          if (orientation === "horizontal") {
            for (let i = 0; i < size; i++) {
              newBoardData[y]![x + i] = `${shipType}-${i}`;
            }
          } else {
            for (let i = 0; i < size; i++) {
              newBoardData[y + i]![x] = `${shipType}-${i}`;
            }
          }

          newPlacedShips[shipType] = {
            size,
            orientation,
            count: 0,
            x,
            y
          };
          placed = true;
        }
      }
    });

    setPlacedShips(newPlacedShips);
    setBoardData(newBoardData);
    setShipCount(prev => {
      const newCounts = { ...prev };
      Object.keys(shipProps).forEach(type => {
        newCounts[type] = { count: 0 };
      });
      return newCounts;
    });
  };


  export const handleDrop = (e: React.DragEvent<HTMLElement>, boardData: BoardType, id: string, draggedShip: { size: number; orientation: "horizontal" | "vertical"; count: number; x: number; y: number } | null, placedShips: Record<string, { size: number; orientation: "horizontal" | "vertical"; count: number; x: number; y: number }>, setPlacedShips: (ships: Record<string, { size: number; orientation: "horizontal" | "vertical"; count: number; x: number; y: number }>) => void, setShipCount: (count: Record<string, { count: number }>) => void) => {
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
        type: string,
        size: number,
        count: number,
        orientation: "horizontal" | "vertical",
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

        if (isPlacementValid(adjustedX, adjustedY, shipData.size, shipData.orientation, boardData, shipData.type)) {
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

          setShipCount(prev => ({
            ...prev,
            [shipData.type]: {
              ...shipProps[shipData.type],
              count: shipProps[shipData.type]!.count - 1
            }
          }));
        }
      }
    } catch (error) {
      console.error("Error handling ship drop:", error);
    }
  };