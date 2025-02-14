import React from 'react'
import Image from 'next/image'

const DestinationPin: React.FC<{ stationName: string }> = ({ stationName }) => {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* 지하철 아이콘 */}
      <div className="flex w-7 h-7 p-0.5 justify-center items-center gap-[10px] flex-shrink-0 rounded-full border-2 border-[#FFCF33] bg-[#FFCF33]">
        <Image
          src="/subwayWhite.svg" // 지하철 아이콘
          alt="Subway Icon"
          width={24}
          height={24}
          style={{
            zIndex: 4,
          }}
        />
      </div>
      {/* 노란 삼각형 */}
      <div className="absolute top-[18px] w-7 h-[21px] z-2">
        <Image
          src="/Polygon2Yellow.svg" // 삼각형 이미지
          alt="Yellow Polygon"
          width={28}
          height={21}
        />
      </div>
      {/* 목적지 이름 */}
      <div className="text-white text-center font-['Pretendard'] text-xs font-medium leading-[17px] tracking-[-0.5px] mt-[9px] px-2 py-1 rounded-full border border-[#9562FB] bg-[#9562FB] flex h-4 justify-center items-center gap-3">
        {stationName}
      </div>
    </div>
  )
}

export default DestinationPin
