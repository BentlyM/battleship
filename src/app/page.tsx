import { api, HydrateClient } from "~/trpc/server";
import {Board as ShowBoard} from "./_components/Board";


type Cell = string;
export type Board = Array<Array<Cell>>;

const BOARD_SIZE = 10;
const SHIP_SIZE = [5, 4, 3, 3, 2];

const createBoard = (): Board => Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(''));

export default async function Home() {  
  return (
    <HydrateClient>
      <main className="flex flex-row items-center justify-center h-screen w-screen">
        <div className="flex flex-col items-center justify-center w-3/4">
        <div className="flex justify-center flex-row w-2/3">
          <ShowBoard board={{id: 'player-board', boardData: createBoard()}} />
          <ShowBoard board={{id: 'bot-board', boardData: createBoard()}} />
        </div>
        </div>
      </main>
    </HydrateClient>
  );
}
