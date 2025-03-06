"use client";

import React from "react";

interface ShipHeadProps {
  orientation: "horizontal" | "vertical";
}

const ShipHead: React.FC<ShipHeadProps> = ({ orientation }) => {
  return (
    <div
      className={`relative flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 ${orientation === "horizontal" ? "rounded-l-full" : "rounded-t-full"} transition-all duration-300`}
    >
      <div className="size-2 rounded-full bg-gray-600" />
    </div>
  );
};

export const AttackedShipHead: React.FC<ShipHeadProps> = ({ orientation }) => {
  return (
    <div
      className={`relative flex h-8 w-8 items-center justify-center rounded-sm bg-gray-400 ${orientation === "horizontal" ? "rounded-l-full" : "rounded-t-full"} transition-all duration-300`}
    >
      <div className="size-3 rounded-full bg-red-600" />
    </div>
  );
};

export default ShipHead;
