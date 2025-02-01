'use client'

import React from 'react'

interface VisitorPhotoProps {
  selectedPlace: string[] // pictures 배열
}

const VisitorPhoto: React.FC<VisitorPhotoProps> = ({ selectedPlace }) => {
  if (!selectedPlace || selectedPlace.length === 0) {
    return <div style={{ marginTop: '20px' }}>사진이 없습니다.</div>
  }

  return (
    <div
      style={{
        marginTop: '20px',
        backgroundColor: '#f7f7f7',
        paddingLeft: '8px',
        paddingRight: '8px',
      }}
    >
      {/* Masonry 스타일 컨테이너 */}
      <div
        style={{
          columnCount: 3, // Masonry 열 수
          columnGap: '2px', // Masonry 열 간격
        }}
      >
        {selectedPlace.map((photo, index) => (
          <div
            key={index}
            style={{
              marginBottom: '2px',
              borderRadius: '24px', // 둥근 테두리
              overflow: 'hidden',
            }}
          >
            <img
              src={photo}
              alt={`Visitor ${index}`}
              style={{
                width: '100%',
                height: 'auto', // 이미지 비율 유지
                display: 'block', // 이미지가 블록처럼 렌더링
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisitorPhoto