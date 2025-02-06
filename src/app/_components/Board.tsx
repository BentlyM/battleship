'use client';
import React from 'react';
import Ship, { shipProps } from './Ship';

interface BoardProps {
  board: {
    id: string;
    boardData: any[][];
    activeBoard: 'player' | 'bot';
  };
  onClick?: () => void;
}

const Board: React.FC<BoardProps> = ({ board, onClick }) => {
  const { id, boardData, activeBoard } : BoardProps['board'] = board;
  const [draggedShip, setDraggedShip] = React.useState<{
    type: string;
    size: number;
    orientation: 'horizontal' | 'vertical';
    x: number;
    y: number;
  } | null>(null);
  const isActive = (id === 'player-board' && activeBoard === 'player') || 
                  (id === 'bot-board' && activeBoard === 'bot');

  // Column headers for the game board (A to J)
  const columnHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  const handleDragStart = (e: React.DragEvent) => {
    const shipDataStr = e.dataTransfer.getData('application/json');
    if (shipDataStr) {
      const shipData = JSON.parse(shipDataStr);
      setDraggedShip({ ...shipData, x: -1, y: -1 });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedShip) return;
    
    const target = e.target as HTMLElement;
    const table = target.closest('table');
    if (!table) return;
  
    const rect = table.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
  
    const cellSize = 32;
    const borderSpacing = 3;
  
    // Snap to grid calculation
    const x = Math.floor(mouseX / (cellSize + borderSpacing)) - 1;
    const y = Math.floor(mouseY / (cellSize + borderSpacing)) - 1;
  
    // Adjust position based on orientation and size to keep highlight centered
    const adjustedX = draggedShip.orientation === 'horizontal' 
      ? Math.max(0, Math.min(x, boardData.length - draggedShip.size))
      : Math.max(0, Math.min(x, boardData.length - 1));
  
    const adjustedY = draggedShip.orientation === 'vertical'
      ? Math.max(0, Math.min(y, boardData[0]!.length - draggedShip.size))
      : Math.max(0, Math.min(y, boardData[0]!.length - 1));
  
    if (adjustedX !== draggedShip.x || adjustedY !== draggedShip.y) {
      setDraggedShip(prev => prev ? { ...prev, x: adjustedX, y: adjustedY } : null);
    }
  };

  const handleDragEnd = () => {
    setDraggedShip(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableElement>) => {
    e.preventDefault();
  };

  const isPlacementValid = (x: number, y: number, size: number, orientation: 'horizontal' | 'vertical') => {
    if (orientation === 'horizontal') {
      return x + size <= boardData.length && y < boardData[0]!.length;
    } else {
      return y + size <= boardData[0]!.length && x < boardData.length;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    
    try {
      const target = e.target as HTMLElement;
      const table = target.closest('table');
      if (!table) return;

      // Get the mouse position relative to the table
      const rect = table.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate cell size (including border spacing)
      const cellSize = 32; // 32px for w-8 h-8, or 40px for sm:w-10 sm:h-10
      const borderSpacing = 3; // From border-spacing-[3px]

      // Calculate the nearest grid cell
      const x = Math.floor(mouseX / (cellSize + borderSpacing)) - 1; // -1 for header column
      const y = Math.floor(mouseY / (cellSize + borderSpacing)) - 1; // -1 for header row

      // Validate the position
      if (x < 0 || x >= boardData.length || y < 0 || y >= boardData[0]!.length) {
        console.error('Invalid drop position');
        return;
      }

      const shipDataStr = e.dataTransfer.getData('application/json');
      if (!shipDataStr) {
        console.error('No ship data received');
        return;
      }

      const shipData = JSON.parse(shipDataStr);
      
      // Handle ship placement logic here
      console.log('Ship dropped at:', { ...shipData, x, y});
      
    } catch (error) {
      console.error('Error handling ship drop:', error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto p-4" onClick={onClick} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <h3 className="text-xl font-semibold mb-6 text-center">
        {id === 'player-board' ? 'Player Board' : 'Bot Board'}
      </h3>
      <div className="w-full aspect-square">
        <div className="overflow-x-auto">
          <table 
            className="w-full table-fixed border-separate border-spacing-[3px]"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
          >
            <tbody className="board" id={id}>
              <tr>
                <th className="w-8 h-8 sm:w-10 sm:h-10"></th>
                {columnHeaders.map((header, index) => (
                  <th 
                    key={index} 
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-center text-sm sm:text-base
                      ${isActive ? 'text-black' : 'text-transparent'} transition-colors duration-300`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
              {boardData.map((row: any[], rowIndex: number) => (
  <tr key={rowIndex}>
                  <th 
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-center text-sm sm:text-base
                      ${isActive ? 'text-black' : 'text-transparent'} transition-colors duration-300`}
                  >
                    {rowIndex + 1}
                  </th>
    {row.map((cell: any, columnIndex: number) => {
      // Calculate highlight area
      const isHighlighted = draggedShip && 
        ((draggedShip.orientation === 'horizontal' &&
          columnIndex >= draggedShip.x &&
          columnIndex < draggedShip.x + draggedShip.size &&
          rowIndex === draggedShip.y) ||
        (draggedShip.orientation === 'vertical' &&
          rowIndex >= draggedShip.y &&
          rowIndex < draggedShip.y + draggedShip.size &&
          columnIndex === draggedShip.x));

      const isValid = isHighlighted && 
        isPlacementValid(draggedShip!.x, draggedShip!.y, draggedShip!.size, draggedShip!.orientation);

      const cellClass = id === 'player-board' 
        ? 'bg-board-cell' 
        : 'cursor-pointer bg-gray-200 hover:bg-board-cell-hover';

      return (
        <td
          key={columnIndex}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm ${cellClass} ${
            isHighlighted ? (isValid ? 'bg-green-200' : 'bg-red-200') : ''
          } transition-colors duration-200`}
        />
      );
    })}
  </tr>
))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ships section - only show for player board */}
      {id === 'player-board' && (
        <div className="p-4 w-full border-2 border-gray-200 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Your Ships</h4>
          <div className="flex flex-wrap gap-4 justify-center overflow-auto h-[176px] w-[440px]">
            {Object.entries(shipProps).map(([type, props]) => (
              <Ship
                key={type}
                type={type}
                size={props.size}
                orientation={props.orientation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { Board };
