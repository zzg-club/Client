'use client'

import React from 'react'

const VisitorPhoto = () => {
  const photos = [
    '/meat1.png',
    '/meat2.png',
    '/meat3.png',
    '/meat4.png',
    '/meat5.png',
    '/meat6.png',
    '/meat7.png',
    '/meat8.png',
    '/meat9.png',
    '/meat10.png',
    '/meat11.png',
  ]

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
          columnCount: 3, // 열의 개수를 설정 (필요에 따라 조정 가능)
          columnGap: '2px', // 열 간격 2px
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            style={{
              marginBottom: '2px', // 각 이미지 사이의 간격 2px
              borderRadius: '24px', // 둥근 모서리 적용
              overflow: 'hidden', // 둥근 모서리에 맞게 이미지 잘림
            }}
          >
            <img
              src={photo}
              alt={`Visitor ${index}`}
              style={{
                width: '100%',
                height: 'auto', // 가로 크기를 맞추면서 세로는 원본 비율 유지
                display: 'block', // inline 요소 사이 여백 제거
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisitorPhoto
