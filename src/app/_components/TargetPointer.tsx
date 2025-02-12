import React from 'react'
import Image from 'next/image'
function TargetPointer({ x, y }: { x: number, y: number }) {
  console.log(x, y);
  return (
    <div className='absolute' style={{
      top: `${y * 40 + 46}px`,
      left: `${x * 40 + 50}px`,
    }}>
        <Image src='/target-pointer.svg' alt='target pointer' width={40} height={40} />
    </div>
  )
}

export default TargetPointer