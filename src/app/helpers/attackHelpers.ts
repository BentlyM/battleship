import type { Dispatch, SetStateAction } from "react";
import type { Board, SetBoardData, ShipType } from "~/types/game";

export const handlePlayerAttack = (
  e: React.MouseEvent<HTMLTableElement>,
  boardData: Board,
  setBoardData: SetBoardData,
  setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>,
  handleAttackResult: (isHit: boolean) => void,
  checkForWinner: (boardData: Board) => boolean,
  setSunkShips: Dispatch<SetStateAction<Record<ShipType, boolean>>>,
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>,
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
    setBoardData(newBoardData);

    const shipTypes: ShipType[] = [
      "carrier",
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
    ];
    const shipSizes: Record<ShipType, number> = {
      carrier: 5,
      battleship: 4,
      cruiser: 3,
      submarine: 3,
      destroyer: 2,
    };

    shipTypes.forEach((shipType) => {
      const shipSize = shipSizes[shipType];
      const hitCount = newBoardData
        .flat()
        .filter((cell) => cell?.startsWith(`${shipType}-hit`)).length;

      if (hitCount === shipSize) {
        setSunkShips((prev) => ({ ...prev, [shipType]: true }));
      }
    });

    if (checkForWinner(newBoardData)) {
      console.log("player won")
      setIsGameOver(true);
    }
  }
};
