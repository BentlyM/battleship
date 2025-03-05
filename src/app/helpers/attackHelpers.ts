import type { Dispatch, SetStateAction } from "react";
import type { Board, SetBoardData } from "~/types/game";

export const handlePlayerAttack = (
  e: React.MouseEvent<HTMLTableElement>,
  boardData: Board,
  setBoardData: SetBoardData,
  setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>,
  handleAttackResult: (isHit: boolean) => void,
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
            handleAttackResult(true);
            return "hit";
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

    // Trigger any additional game logic (e.g., check if a ship was sunk)
  }
};
