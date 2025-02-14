export type Orientation = "horizontal" | "vertical";

export type ShipType =
  | "carrier"
  | "battleship"
  | "cruiser"
  | "submarine"
  | "destroyer";

export type Ship = {
  size: number;
  orientation: Orientation;
  count: number;
  x: number;
  y: number;
  type?: ShipType;
};

export type PlacedShips = {
  [key in ShipType]?: Ship;
};

export type ShipCount = {
  [key in ShipType]: {
    count: number;
  };
};

export type Board = string[][];

export type BoardProps = {
  board: {
    id: string;
    boardData: Board;
    activeBoard: "player" | "bot";
    setBoardData: (boardData: Board) => void;
  };
  onClick?: () => void;
};

export type ShipProps = {
  [key in ShipType]: {
    size: number;
    orientation: Orientation;
    count: number;
  };
};

export type DraggedShip = Ship | null;

export type SetDraggedShip = (ship: Ship | null) => void;

export type SetPlacedShips = (ships: PlacedShips) => void;

export type SetShipCount = (
  count: ShipCount | ((prev: ShipCount) => ShipCount),
) => void;

export type SetBoardData = (board: Board) => void;