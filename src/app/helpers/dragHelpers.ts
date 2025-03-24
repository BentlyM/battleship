import type { Board } from "~/types/game";

export const handleDragStart = (
  e: React.DragEvent,
  setDraggedShip: (ship: {
    size: number;
    orientation: "horizontal" | "vertical";
    count: number;
    x: number;
    y: number;
  }) => void,
) => {
  const shipDataStr = e.dataTransfer.getData("application/json");
  if (shipDataStr) {
    const shipData = JSON.parse(shipDataStr) as {
      size: number;
      orientation: "horizontal" | "vertical";
      count: number;
    };
    setDraggedShip({ ...shipData, x: -1, y: -1 });
  }
};

export const handleDragOver = (
  e: React.DragEvent<HTMLTableElement>,
  boardData: Board,
  draggedShip: {
    size: number;
    orientation: "horizontal" | "vertical";
    count: number;
    x: number;
    y: number;
  } | null,
  setDraggedShip: (ship: {
    size: number;
    orientation: "horizontal" | "vertical";
    count: number;
    x: number;
    y: number;
  }) => void,
) => {
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

  const x = Math.floor(mouseX / (cellSize + borderSpacing)) - 1;
  const y = Math.floor(mouseY / (cellSize + borderSpacing)) - 1;

  const adjustedX =
    draggedShip.orientation === "horizontal"
      ? Math.max(0, Math.min(x, boardData.length - draggedShip.size))
      : Math.max(0, Math.min(x, boardData.length - 1));

  const adjustedY =
    draggedShip.orientation === "vertical"
      ? Math.max(0, Math.min(y, boardData[0]!.length - draggedShip.size))
      : Math.max(0, Math.min(y, boardData[0]!.length - 1));
  if (adjustedX !== draggedShip.x || adjustedY !== draggedShip.y) {
    setDraggedShip({ ...draggedShip, x: adjustedX, y: adjustedY });
  }
};

export const handleDragEnd = (
  setDraggedShip: (
    ship: {
      size: number;
      orientation: "horizontal" | "vertical";
      count: number;
      x: number;
      y: number;
    } | null,
  ) => void,
) => {
  setDraggedShip(null);
};

export const handleDragEnter = (e: React.DragEvent<HTMLTableElement>) => {
  e.preventDefault();
};
