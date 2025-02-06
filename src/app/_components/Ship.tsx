import React, { useState } from 'react'

export const shipProps: { [key: string]: { size: number; orientation: 'horizontal' | 'vertical'; } } = {
    carrier: {
        size: 5,
        orientation: 'horizontal',
    },
    battleship: {
        size: 4,
        orientation: 'horizontal',
    },
    cruiser: {
        size: 3,
        orientation: 'horizontal',
    },
    submarine: {
        size: 3,
        orientation: 'horizontal',
    },
    destroyer: {
        size: 2,
        orientation: 'horizontal',        
    }
}

interface ShipProps {
    type: string;
    size: number;
    orientation: string;
}

const Ship: React.FC<ShipProps> = ({ type, size, orientation: initialOrientation }) => {
    const [orientation, setOrientation] = useState(initialOrientation);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        try {
            const shipData = {
                type,
                size,
                orientation,
            };
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(shipData));
        } catch (error) {
            console.error('Error starting drag:', error);
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    };

    return (
        <div
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            className="flex items-center justify-center my-2 cursor-move select-none transition-transform duration-300"
        >
            <div 
                className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} relative transition-all duration-300`}
                role="img"
                aria-label={`${type} ship`}
            >
                {/* Ship head (pointer) */}
                <div className={`
                    w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center relative
                    ${orientation === 'horizontal' ? 'rounded-l-full' : 'rounded-t-full'}
                    transition-all duration-300
                `}>
                    <div className="w-2 h-2 bg-gray-600 rounded-full" />
                </div>
                
                {/* Ship body */}
                {Array.from({ length: Math.max(0, size - 2) }).map((_, index) => (
                    <div 
                        key={index} 
                        className="w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center transition-all duration-300"
                    >
                        <div className="w-2 h-2 bg-gray-600 rounded-full" />
                    </div>
                ))}
                
                {/* Ship tail */}
                <div className={`
                    w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center
                    ${orientation === 'horizontal' ? 'rounded-r-full' : 'rounded-b-full'}
                    transition-all duration-300
                `}>
                    <div className="w-2 h-2 bg-gray-600 rounded-full" />
                </div>
            </div>
            <span className="ml-2 text-sm text-gray-600 capitalize select-none">{type}</span>
        </div>
    );
};

export default Ship