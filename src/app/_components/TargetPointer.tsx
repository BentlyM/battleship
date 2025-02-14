import React from "react";
import Image from "next/image";

function TargetPointer({ x, y }: { x: number; y: number }) {
  return (
    <div className="flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <Image
        src="/target-pointer.svg"
        alt="target pointer"
        width={32}
        height={32}
        className={`${x === 0 && y === 0 ? "animate-pulse" : ""}`}
      />
    </div>
  );
}

export default TargetPointer;
