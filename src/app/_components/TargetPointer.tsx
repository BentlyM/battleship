import React from "react";
import Image from "next/image";

function TargetPointer({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="pointer-events-none absolute transition-[transform] duration-200 ease-in-out"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: "transform",
        zIndex: 1,
      }}
    >
      <div className="flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <Image
          src="/target-pointer.svg"
          alt="target pointer"
          width={32}
          height={32}
        />
      </div>
    </div>
  );
}

export default TargetPointer;
