import React from 'react'

interface MiddleFooter2RightProps {
  onClick?: () => void // 클릭 이벤트 핸들러
}

const MiddleFooter2Right: React.FC<MiddleFooter2RightProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex w-6 h-9 justify-center items-center gap-2 flex-shrink-0 rounded-full bg-[#9562FB] border-none cursor-pointer"
    >
      <img
        src="/arrow_white_mirrored.svg"
        alt="Slide Button"
        style={{
          width: '24px',
          height: '24px',
          objectFit: 'contain',
        }}
      />
    </button>
  )
}

export default MiddleFooter2Right
