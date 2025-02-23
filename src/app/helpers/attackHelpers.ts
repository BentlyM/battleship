import type { Dispatch, SetStateAction } from "react";
import type { Board, SetBoardData } from "~/types/game";

export const handlePlayerAttack = (
  e: React.MouseEvent<HTMLTableElement>,
  boardData: Board,
  setBoardData: SetBoardData,
  setActiveBoard: Dispatch<SetStateAction<"player" | "bot">>,
) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "TD") {
    const x = parseInt(target.getAttribute("data-x")!);
    const y = parseInt(target.getAttribute("data-y")!);

    // Check if the cell has already been attacked
    if (boardData[y]![x] === "hit" || boardData[y]![x] === "miss") {
      console.log("you already hit or missed this cell");
      return; // Ignore already attacked cells
    } // should probably handle this but idk what to make it do lol

    // Update the board data based on the attack
    const newBoardData = boardData.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        boardData[y]?.[x] // Using optional chaining
          ? rowIndex === y && colIndex === x && boardData[rowIndex]![colIndex]
            ? "hit"
            : cell
          : (setActiveBoard("player"),
            rowIndex === y && colIndex === x ? "miss" : cell),
      ),
    );
    setBoardData(newBoardData);

    // Trigger any additional game logic (e.g., check if a ship was sunk)
  }
};
