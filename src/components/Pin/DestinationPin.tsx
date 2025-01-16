import React from 'react'

const DestinationPin: React.FC<{ stationName: string }> = ({ stationName }) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 지하철 아이콘 */}
      <div
        style={{
          display: 'flex',
          width: '28px',
          height: '28px',
          padding: '2px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          borderRadius: '24px',
          border: '2px solid var(--subway_time, #FFCF33)',
          background: 'var(--subway_time, #FFCF33)',
        }}
      >
        <img
          src="/subwayWhite.svg" // 지하철 아이콘
          alt="Subway Icon"
          style={{
            width: '24px',
            height: '24px',
            zIndex: 4,
          }}
        />
      </div>
      {/* 노란 삼각형 */}
      <div
        style={{
          position: 'absolute',
          top: '18px', // 원 아래에 삼각형 위치
          width: '28px',
          height: '21px',
          zIndex: 2,
        }}
      >
        <img
          src="/Polygon2Yellow.svg" // 삼각형 이미지
          alt="Yellow Polygon"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      {/* 목적지 이름 */}
      <div
        style={{
          color: 'var(--Grays-White, #FFF)',
          textAlign: 'center',
          fontFamily: 'Pretendard',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '17px',
          letterSpacing: '-0.5px',
          marginTop: '9px',
          padding: '4px 8px',
          borderRadius: '24px',
          border: '1px solid var(--MainColor, #9562FB)',
          background: 'var(--MainColor, #9562FB)',
          display: 'flex',
          height: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {stationName}
      </div>
    </div>
  )
}

export default DestinationPin
