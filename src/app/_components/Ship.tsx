"use client";

import React, { useState } from "react";
import ShipHead from "./ship/ShipHead";
import ShipBody from "./ship/ShipBody";
import ShipTail from "./ship/ShipTail";
import type { ShipProps as PropsForShip } from "~/types/game";
import { motion, useAnimation } from "framer-motion";

export const shipProps: PropsForShip = {
  carrier: {
    size: 5,
    orientation: "horizontal",
    count: 1,
  },
  battleship: {
    size: 4,
    orientation: "horizontal",
    count: 1,
  },
  cruiser: {
    size: 3,
    orientation: "horizontal",
    count: 1,
  },
  submarine: {
    size: 3,
    orientation: "horizontal",
    count: 1,
  },
  destroyer: {
    size: 2,
    orientation: "horizontal",
    count: 1,
  },
};

interface ShipProps {
  type: string;
  size: number;
  orientation: string;
  active: boolean;
  count: number;
}

const Ship: React.FC<ShipProps> = ({
  type,
  size,
  orientation: initialOrientation,
  active,
  count,
}) => {
  const [orientation, setOrientation] = useState(initialOrientation);
  const [isAnimating, setIsAnimating] = useState(true);
  const controls = useAnimation();

  React.useEffect(() => {
    const animate = async () => {
      await controls.start({
        x: 0,
        opacity: 1,
        transition: { duration: 1, ease: "easeInOut" },
      });
      setIsAnimating(false);
    };

    controls.set({ x: -100, opacity: 0 });
    animate()
      .then()
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.log(err.message);
        }
      });
  }, [controls]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    try {
      const shipData = {
        type,
        size,
        orientation,
        count,
      };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify(shipData));
    } catch (error) {
      console.error("Error starting drag:", error);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    e.preventDefault();
    setOrientation((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal",
    );
  };

  return (
    <motion.div animate={controls}>
      <div
        draggable={active && !isAnimating}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className="my-2 flex cursor-move select-none items-center justify-center transition-transform duration-300"
      >
        <div
          className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} relative transition-all duration-300 ${count <= 0 ? "opacity-[0.5]" : "opacity-1"}`}
          role="img"
          aria-label={`${type} ship`}
        >
          {/* Ship head */}
          <ShipHead orientation={orientation as "horizontal" | "vertical"} />

          {/* Ship body */}
          {Array.from({ length: Math.max(0, size - 2) }).map((_, index) => (
            <ShipBody key={index} index={index} />
          ))}

          {/* Ship tail */}
          <ShipTail orientation={orientation as "horizontal" | "vertical"} />
        </div>
        <span className="select-none text-sm capitalize text-gray-700">{`(${count}) `}<span className="ml-1">{type} ship</span></span>
      </div>
    </motion.div>
  );
};

export default Ship;
