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

export type PlacedShips = Record<ShipType, Ship>;

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

// types/game.ts
export type GameEventMessage = {
  player: string;
  bot: string;
  trigger: "hit" | "miss" | "turn" | "prologue";
  active?: 'player' | 'bot'
};

export type Stats = {
  accuracy: number,
  sunkShips: number,
  shots: number,
  time: number,
  win: 'win' | 'lose' | undefined
}

type ShipDetails = {
  size: number;
  orientation: Orientation;
  count: number;
};

export type ShipProps = Record<string, ShipDetails>;

export type DraggedShip = Ship | null;

export type SetDraggedShip = (ship: Ship | null) => void;

export type SetPlacedShips = (ships: PlacedShips) => void;

export type CheckForWinner = (boardData: Board) => boolean;

export type SetShipCount = (
  count: ShipCount | ((prev: ShipCount) => ShipCount),
) => void;

export type SetBoardData = (board: Board | ((prev: Board) => Board)) => void;
