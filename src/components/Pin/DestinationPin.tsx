import React from 'react'

const DestinationPin: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '32px',
        height: '50px', // 전체 크기 (원 + 삼각형)
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0px',
      }}
    >
      {/* 노란 원과 지하철 아이콘 */}
      <div
        style={{
          position: 'absolute',
          top: '0px',
          width: '32px',
          height: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3, // 삼각형 위에 배치
        }}
      >
        <img
          src="/roundYellow.svg" // 노란 원
          alt="Yellow Circle"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
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
          top: '21px', // 원 아래에 삼각형 위치
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
    </div>
  )
}

export default DestinationPin
