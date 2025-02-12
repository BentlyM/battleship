import React from 'react'
import Image from 'next/image'

function TargetPointer({ x, y }: { x: number, y: number }) {
  return (
    <div className="w-10 h-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
      <Image 
        src='/target-pointer.svg' 
        alt='target pointer' 
        width={32} 
        height={32}
      className={`animate-pulse ${x === 0 && y === 0 ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}

export default TargetPointer