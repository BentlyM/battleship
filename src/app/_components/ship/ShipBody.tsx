'use client';

import React from 'react';

interface ShipBodyProps {
  index: number;
}

const ShipBody: React.FC<ShipBodyProps> = ({ index }) => {
  return (
    <div 
      key={index} 
      className="w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center transition-all duration-300"
    >
      <div className="w-2 h-2 bg-gray-600 rounded-full" />
    </div>
  );
};

export default ShipBody;
