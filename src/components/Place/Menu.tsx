'use client';

import React from 'react';

const Menu = () => {
  const menuItems = [
    { name: '생갈비', price: '65,000원', image: '/meat1.png' },
    { name: '특등심', price: '34,000원', image: '/meat2.png' },
    { name: '살치살', price: '37,000원', image: '/meat3.png' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#F5F6F8',
        padding: '16px 22px', // 양옆 22px 패딩 추가
      }}
    >
      <div>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              height: '100px',
              justifyContent: 'flex-start', // 이미지와 텍스트를 정렬
              alignItems: 'center',
              marginBottom: '12px',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden', // 이미지 넘침 방지
            }}
          >
            <div
              style={{
                flex: '0 0 100px', // 이미지가 고정된 너비를 가짐
                height: '100%',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // 이미지를 꽉 채움
                }}
              />
            </div>
            <div
              style={{
                paddingLeft: '16px', // 텍스트와 이미지 간 간격
                flex: 1,
              }}
            >
              <p
                style={{
                  margin: '4px 0',
                  color: '#000',
                  textAlign: 'left',
                  fontFamily: 'Pretendard',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '17px',
                  letterSpacing: '-0.5px',
                  marginBottom: '16px',
                }}
              >
                {item.name}
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#9562FB',
                  fontFamily: 'Pretendard',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '17px',
                  letterSpacing: '-0.5px',
                }}
              >
                {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
