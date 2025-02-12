import React from 'react'
import Image from 'next/image'
function TargetPointer({ x, y }: { x: number, y: number }) {
  return (
    <div className='absolute top-0 left-0'>
        <Image src='/target-pointer.svg' alt='target pointer' width={40} height={40} />
    </div>
  )
}

export default TargetPointer