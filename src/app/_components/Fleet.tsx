import { useEffect, type Dispatch, type SetStateAction } from "react";
import Ship, { shipProps } from "./Ship";
import { Button } from "~/components/ui/button";
import type {
  Board as BoardType,
  SetBoardData,
  PlacedShips,
  ShipCount,
} from "~/types/game";
import Image from "next/image";
import { createBoard } from "./BoardStack";

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
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  isGameOver: boolean;
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
    setIsGameOver,
    isGameOver,
  } = props;

  useEffect(() => {
    if (isGameOver) handleRemoveShips();
  }, [isGameOver]);

  const handleStartGame = async () => {
    if (isGameOver) setIsGameOver(false);
    if (Object.values(shipCount).every((ship) => ship.count === 0)) {
      setGameStarted(true);
    } else {
      alert("Please place all ships before starting the game");
      return;
    }
  };

  const handleEndGame = () => {
    if (gameStarted && !isGameOver) {
      setGameStarted(false);
      setIsGameOver(true);
      handleRemoveShips();
    }
  };

  const handleRemoveShips = () => {
    setPlacedShips({} as PlacedShips);
    setShipCount({
      ...shipCount,
      carrier: { count: 1 },
      battleship: { count: 1 },
      cruiser: { count: 1 },
      submarine: { count: 1 },
      destroyer: { count: 1 },
    });
    setBoardData(createBoard());
  };

  return (
    <div
      className={`rounded-lg border-gray-200 p-4 ${!gameStarted && "md:border-2"} dark:border-gray-600 ${gameStarted && "md:mb-[176px]"}`}
    >
      <div className="flex flex-row justify-evenly flex-wrap gap-2 overflow-x-auto">
        {!gameStarted && (
            <h4 className="mb-4 hidden text-lg font-semibold md:block dark:text-white">
              Fleet
            </h4>
          )}
        {!gameStarted && (
          <Button
            variant="outline"
            className="h-8 rounded-full px-3 text-sm dark:border-gray-600 dark:bg-[#080808] dark:text-white"
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
        )}
        {!gameStarted && (
          <Button
            variant="outline"
            className="h-8 rounded-full px-3 text-sm dark:border-gray-600 dark:bg-[#080808] dark:text-white"
            onClick={handleRemoveShips}
            disabled={!isActive || gameStarted}
          >
            Remove Ships
          </Button>
        )}
        <Button
          variant="outline"
          className="h-8 rounded-full border-none bg-green-500 px-3 text-sm text-white hover:bg-green-600"
          onClick={handleStartGame}
          disabled={gameStarted}
        >
          Start Game
        </Button>
        {gameStarted && (
          <Button
            className="h-8 rounded-full bg-red-500 px-3 text-sm text-white hover:bg-red-600"
            onClick={handleEndGame}
            disabled={isActive}
          >
            End Game
          </Button>
        )}
      </div>
      <div
        className={`flex flex-wrap justify-center gap-4 overflow-y-auto transition-all duration-300 ${gameStarted ? "h-0 opacity-0" : "relative h-0 rounded opacity-100 md:h-[176px]"}`}
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
  );
};

export default Fleet;
