'use client';

import React from 'react';

const VisitorPhoto = () => {
  const photos = [
    '/meat1.png',
    '/meat4.png',
    '/meat7.png',
    '/meat2.png',
    '/meat5.png',
    '/meat8.png',
    '/meat3.png',
    '/meat6.png',
    '/meat9.png',
  ];

  return (
    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f7f7f7' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '8px', // 이미지 간격을 적당히 조정
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              aspectRatio: '1', // 정사각형 비율 유지
              overflow: 'hidden',
              borderRadius: '8px', // 둥근 모서리 적용
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // 약간의 그림자 효과 추가
            }}
          >
            <img
              src={photo}
              alt={`Visitor ${index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover', // 사진이 컨테이너를 꽉 채움
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitorPhoto;
