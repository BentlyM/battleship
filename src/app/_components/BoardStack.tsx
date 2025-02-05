// src/components/BoardStack.tsx
'use client';
import { useState } from 'react';
import { Board as ShowBoard } from './Board';

type Cell = string;
export type Board = Array<Array<Cell>>;
const BOARD_SIZE = 10;
const createBoard = (): Board => Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(''));


export const BoardStack = () => {
  const [activeBoard, setActiveBoard] = useState<'player' | 'bot'>('player');

  return (
    <div className="relative h-[440px] w-[340px]">
      {/* Player Board */}
      <div
        className={`absolute transition-all duration-500 ease-in-out ${
          activeBoard === 'player'
            ? 'z-30 left-0 top-0'
            : 'z-20 left-4 top-4 opacity-75'
        }`}
      >
        <ShowBoard board={{ id: 'player-board', boardData: createBoard(), activeBoard }} />
      </div>

      {/* Bot Board */}
      <div
        className={`absolute transition-all duration-500 ease-in-out ${
          activeBoard === 'bot'
            ? 'z-30 left-0 top-0'
            : 'z-10 left-8 top-8 opacity-75'
        }`}
      >
        <ShowBoard board={{ id: 'bot-board', boardData: createBoard(), activeBoard }} />
      </div>
    </div>
  );
};