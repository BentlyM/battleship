import type { Dispatch, SetStateAction } from "react";
import type { Board, SetBoardData, ShipType, Stats } from "~/types/game";

export const handlePlayerAttack = (
  e: React.MouseEvent<HTMLTableElement>,
  boardData: Board,
  setBoardData: SetBoardData,
  setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>,
  handleAttackResult: (isHit: boolean) => void,
  checkForWinner: (boardData: Board) => boolean,
  setSunkShips: Dispatch<SetStateAction<Record<ShipType, boolean>>>,
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentStats: Dispatch<SetStateAction<Stats>>,
  sunkShips: Record<ShipType, boolean>
) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "TD") {
    const x = parseInt(target.getAttribute("data-x")!);
    const y = parseInt(target.getAttribute("data-y")!);

    if (boardData[y]![x] === "hit" || boardData[y]![x] === "miss") {
      console.log("you already hit or missed this cell");
      return;
    }

    const newBoardData = boardData.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (rowIndex === y && colIndex === x) {
          if (boardData[y]?.[x]) {
            const [shipType] = boardData[y]?.[x].split("-");
            handleAttackResult(true); // Notify a hit (not sunk yet)
            return `${shipType}-hit`;
          } else {
            handleAttackResult(false);
            setActiveBoard("player");
            return "miss";
          }
        }
        return cell;
      }),
    );

    const hits = newBoardData.flat().filter((v) => v?.endsWith("-hit")).length;
    const misses = newBoardData.flat().filter((v) => v === "miss").length;
    const totalShots = hits + misses;
    const currentAccuracy = totalShots > 0 ? (hits / totalShots) * 100 : 0;

    setCurrentStats((prev) => ({
      ...prev,
      accuracy: Number(currentAccuracy.toFixed(2)),
      shots: prev.shots + 1,
    }));

    setBoardData(newBoardData);

    const shipTypes: ShipType[] = [
      "carrier",
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
    ];

    const currentSunkShips = sunkShips;

    const newSunkShips = shipTypes.reduce(
      (acc, shipType) => {
        const shipCells = newBoardData
          .flat()
          .filter(
            (cell) => cell?.startsWith(shipType) && !cell.endsWith("-hit"),
          );
        acc[shipType] = shipCells.length === 0;
        return acc;
      },
      {} as Record<ShipType, boolean>,
    );

    const newlySunk = shipTypes.filter(
      (shipType) => newSunkShips[shipType] && !currentSunkShips[shipType],
    );

    if (newlySunk.length > 0) {
      setSunkShips((prev) => ({
        ...prev,
        ...newSunkShips,
      }));

      setCurrentStats((prev) => ({
        ...prev,
        sunkShips: prev.sunkShips + newlySunk.length,
      }));

      // Trigger any sunk ship events
      // newlySunk.forEach((shipType) => {
      //   handleSunkShipEvent(shipType); // Assuming this function exists
      // });

      if (checkForWinner(newBoardData)) {
        console.log("player won");
        setCurrentStats((prev) => ({
          ...prev,
          gameOutcome: 'win'
        }))
        setIsGameOver(true);
      }
    }
  }
};
