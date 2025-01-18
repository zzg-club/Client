import React from 'react'
import './CustomPin.css'

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
      <div
        className="pin-depart"
        style={{
          color: 'var(--glassmorph-black, #1E1E1E)',
          textAlign: 'center',
          fontFamily: 'Pretendard',
          fontSize: '8px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '17px',
          letterSpacing: '-0.5px',
          border: `1px solid ${isMine ? 'var(--MainColor, #9562fb)' : '#FFCF33'}`,
        }}
      >
        {depart}에서 출발
      </div>
    </div>
  )
}

export default CustomPin
