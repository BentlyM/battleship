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
    <div className="flex items-center justify-evenly w-full h-full">
      <div onClick={() => setActiveBoard('player')}>{'Coming Soon'}</div>
      <div className="relative w-[545px] h-[600px]">
        {/* Player Board */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
            transition-all duration-500 ease-in-out w-full
            ${activeBoard === 'player'
              ? 'z-30 translate-x-[-50%] translate-y-[-50%]'
              : 'z-20 translate-x-[-45%] translate-y-[-47%] opacity-75'
            }`}
        >
          <ShowBoard board={{ id: 'player-board', boardData: createBoard(), activeBoard }} />
        </div>

        {/* Bot Board */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
            transition-all duration-500 ease-in-out w-full
            ${activeBoard === 'bot'
              ? 'z-30 translate-x-[-50%] translate-y-[-72%]'
              : 'z-20 translate-x-[-45%] translate-y-[-67%] opacity-75'
            }`}
        >
          <ShowBoard board={{ id: 'bot-board', boardData: createBoard(), activeBoard }} />
        </div>
      </div>
      <div onClick={() => setActiveBoard('bot')}>{'Coming Soon'}</div>
    </div>
  );
};