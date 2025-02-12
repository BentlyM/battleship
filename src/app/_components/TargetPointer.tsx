import React from 'react'
import Image from 'next/image'

function TargetPointer({ x, y }: { x: number, y: number }) {
  console.log(x, y);
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <Image 
        src='/target-pointer.svg' 
        alt='target pointer' 
        width={32} 
        height={32}
        className="transition-all duration-200"
      />
    </div>
  )
}

export default TargetPointer