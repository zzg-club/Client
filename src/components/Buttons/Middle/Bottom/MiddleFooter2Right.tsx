import React from 'react'
import Image from 'next/image'

interface MiddleFooter2RightProps {
  onClick?: () => void // 클릭 이벤트 핸들러
}

const MiddleFooter2Right: React.FC<MiddleFooter2RightProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex w-6 h-9 justify-center items-center gap-2 flex-shrink-0 rounded-full bg-[#9562FB] border-none cursor-pointer"
    >
      <Image
        src="/arrow_white_mirrored.svg"
        alt="Slide Button"
        width={24}
        height={24}
        style={{
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </button>
  )
}

export default MiddleFooter2Right
