"use client";

import React from "react";

interface ShipTailProps {
  orientation: "horizontal" | "vertical";
}

const ShipTail: React.FC<ShipTailProps> = ({ orientation }) => {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 ${orientation === "horizontal" ? "rounded-r-full" : "rounded-b-full"} transition-all duration-300`}
    >
      <div className="h-2 w-2 rounded-full bg-gray-600" />
    </div>
  );
};

export default ShipTail;
