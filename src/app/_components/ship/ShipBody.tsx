"use client";

import React from "react";

interface ShipBodyProps {
  index: number;
}

const ShipBody: React.FC<ShipBodyProps> = ({ index }) => {
  return (
    <div
      key={index}
      className="flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 transition-all duration-300"
    >
      <div className="size-2 rounded-full bg-gray-600" />
    </div>
  );
};

export const AttackedShipBody: React.FC<ShipBodyProps> = ({ index }) => {
  return (
    <div
      key={index}
      className="flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 transition-all duration-300"
    >
      <div className="size-2 rounded-full bg-red-600" />
    </div>
  );
};

export default ShipBody;
