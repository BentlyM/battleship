import type { Dispatch, SetStateAction } from "react";
import Ship, { shipProps } from "./Ship";
import { Button } from "~/components/ui/button";
import type {
  Board as BoardType,
  SetBoardData,
  PlacedShips,
  ShipCount,
} from "~/types/game";
import Image from "next/image";

interface FleetProps {
  handleAutoPlace: (
    boardData: BoardType,
    placedShips: PlacedShips,
    setPlacedShips: Dispatch<SetStateAction<PlacedShips>>,
    setBoardData: SetBoardData,
    setShipCount: Dispatch<SetStateAction<ShipCount>>,
  ) => void;
  setPlacedShips: Dispatch<SetStateAction<PlacedShips>>;
  setShipCount: Dispatch<SetStateAction<ShipCount>>;
  setBoardData: SetBoardData;
  setGameStarted: (gameStarted: boolean) => void;
  gameStarted: boolean;
  boardData: BoardType;
  shipCount: ShipCount;
  placedShips: PlacedShips;
  isActive: boolean;
}

const Fleet = (props: FleetProps) => {
  const {
    handleAutoPlace,
    setPlacedShips,
    setShipCount,
    setBoardData,
    setGameStarted,
    gameStarted,
    boardData,
    shipCount,
    placedShips,
    isActive,
  } = props;

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
      className={`w-full rounded-lg border-2 border-gray-200 p-4 ${gameStarted && "mb-[176px]"}`}
    >
      <div className="flex flex-row gap-4 justify-center">
        <h4 className="mb-4 text-lg font-semibold">Fleet</h4>
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
            setPlacedShips({} as PlacedShips);
            setShipCount({
              ...shipCount,
              carrier: { count: 1 },
              battleship: { count: 1 },
              cruiser: { count: 1 },
              submarine: { count: 1 },
              destroyer: { count: 1 },
            });
            setBoardData(
              Array.from(
                { length: 10 },
                (): string[] => Array(10).fill("") as string[],
              ) as BoardType,
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
        className={`flex flex-wrap justify-center gap-4 overflow-hidden transition-all duration-300 ${gameStarted ? "h-0 opacity-0" : "relative h-[176px] rounded opacity-100"}`}
      >
        <Image
          src="/water.gif"
          alt=""
          fill
          style={{
            display: `${gameStarted && "none"}`,
            position: "absolute",
            zIndex: -1,
            objectFit: 'cover'
          }}
          unoptimized
        />
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
  );
};

export default Fleet;
