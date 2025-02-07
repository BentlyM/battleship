'use client';

import React from 'react';

interface ShipHeadProps {
  orientation: 'horizontal' | 'vertical';
}

const ShipHead: React.FC<ShipHeadProps> = ({ orientation }) => {
  return (
    <div className={`
      w-8 h-8 bg-gray-400 rounded-sm flex items-center justify-center relative
      ${orientation === 'horizontal' ? 'rounded-l-full' : 'rounded-t-full'}
      transition-all duration-300
    `}>
      <div className="w-2 h-2 bg-gray-600 rounded-full" />
    </div>
  );
};

export default ShipHead;
