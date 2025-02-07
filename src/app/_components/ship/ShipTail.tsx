'use client';

import React from 'react';

interface ShipTailProps {
  orientation: 'horizontal' | 'vertical';
}

const ShipTail: React.FC<ShipTailProps> = ({ orientation }) => {

  return (
    <div className={`
      w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center
      ${orientation === 'horizontal' ? 'rounded-r-full' : 'rounded-b-full'}
      transition-all duration-300
    `}>
      <div className="w-2 h-2 bg-gray-600 rounded-full" />
    </div>
  );
};

export default ShipTail;
