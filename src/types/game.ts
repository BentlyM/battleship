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

export type PlacedShips = Record<ShipType, Ship | undefined>;

export type ShipCount = Record<ShipType, { count: number }>;

export type Board = string[][];

export type BoardProps = {
  board: {
    id: string;
    boardData: Board;
    activeBoard: "player" | "bot";
    setBoardData: SetBoardData;
  };
  onClick?: () => void;
};

type ShipDetails = {
    size: number;
    orientation: Orientation;
    count: number;
};

export type ShipProps = Record<string, ShipDetails>

export type DraggedShip = Ship | null;

export type SetDraggedShip = (ship: Ship | null) => void;

export type SetPlacedShips = (ships: PlacedShips) => void;

export type SetShipCount = (
  count: ShipCount | ((prev: ShipCount) => ShipCount),
) => void;

export type SetBoardData = (board: Board | ((prev: Board) => Board)) => void;
