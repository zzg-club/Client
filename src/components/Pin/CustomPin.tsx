import React from 'react'
import './CustomPin.css'
import Image from 'next/image'

interface CustomPinProps {
  imagePath: string
  isMine?: boolean // 본인 핀 여부를 결정하는 프로퍼티
  depart?: string
}

const CustomPin: React.FC<CustomPinProps> = ({
  imagePath,
  isMine = false,
  depart = '',
}) => {
  return (
    <div className={`pin-container ${isMine ? 'pin-purple' : 'pin-gray'}`}>
      <div
        className="pin-globe"
        style={{ backgroundImage: `url(${imagePath})` }}
      ></div>
      <Image
        src={isMine ? '/Polygon2Purple.svg' : '/Polygon2Gray.svg'}
        className="pin-polygon"
        alt="Polygon shape"
        width="28"
        height="21"
      />
      <div
        className={`flex h-4 px-2 py-2 justify-center items-center gap-3 self-stretch rounded-full bg-white      
            font-medium text-[8px] leading-[17px] tracking-[-0.5px]`}
        style={{
          border: `1px solid ${isMine ? 'var(--MainColor, #9562fb)' : '#AFAFAF'}`,
        }}
      >
        {depart}에서 출발
      </div>
    </div>
  )
}

export default CustomPin
