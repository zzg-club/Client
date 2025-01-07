import React from 'react'
import './CustomPin.css'

interface CustomPinProps {
  imagePath: string
  isMine?: boolean // 본인 핀 여부를 결정하는 프로퍼티
}

const CustomPin: React.FC<CustomPinProps> = ({ imagePath, isMine = false }) => {
  return (
    <div
      className={`pin-container ${isMine ? 'pin-purple' : 'pin-yellow'}`}
      style={{
        borderColor: isMine ? 'var(--MainColor, #9562fb)' : '#FFD700',
      }}
    >
      <div
        className="pin-globe"
        style={{ backgroundImage: `url(${imagePath})` }}
      ></div>
      <img
        src={isMine ? '/Polygon2Purple.svg' : '/Polygon2Yellow.svg'}
        className="pin-polygon"
        alt="Polygon shape"
        width="28"
        height="21"
      />
    </div>
  )
}

export default CustomPin
