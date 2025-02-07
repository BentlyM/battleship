'use client';

import React, { useState } from 'react'
import ShipHead from './ship/ShipHead';
import ShipBody from './ship/ShipBody';
import ShipTail from './ship/ShipTail';

export const shipProps: { [key: string]: { size: number; orientation: 'horizontal' | 'vertical'; count: number } } = {
    carrier: {
        size: 5,
        orientation: 'horizontal',
        count: 1,
    },
    battleship: {
        size: 4,
        orientation: 'horizontal',
        count: 1,
    },
    cruiser: {
        size: 3,
        orientation: 'horizontal',
        count: 1,
    },
    submarine: {
        size: 3,
        orientation: 'horizontal',
        count: 1,
    },
    destroyer: {
        size: 2,
        orientation: 'horizontal',        
        count: 1,
    }
}

interface ShipProps {
    type: string;
    size: number;
    orientation: string;
    active: boolean;
    count: number;
}

const Ship: React.FC<ShipProps> = ({ type, size, orientation: initialOrientation, active, count }) => {
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
        if (!active) return;
        e.preventDefault();
        setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    };

    return (
        <div
            draggable={active}
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
                {/* Ship head */}
                <ShipHead orientation={orientation as 'horizontal' | 'vertical'}/>
                
                {/* Ship body */}
                {Array.from({ length: Math.max(0, size - 2) }).map((_, index) => (
                    <ShipBody key={index} index={index} />
                ))}
                
                {/* Ship tail */}
                <ShipTail orientation={orientation as 'horizontal' | 'vertical'} />
            </div>
            <span className="ml-2 text-sm text-gray-600 capitalize select-none">{`(${count}) ${type} ship`}</span>
        </div>
    );
};

export default Ship