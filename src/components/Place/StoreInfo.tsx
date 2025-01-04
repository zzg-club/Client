'use client';

import React from 'react';

const StoreInfo = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#8E8D8D' }}>영업 시간</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>10:00 - 22:00</p>
          </div>
          <div>
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#8E8D8D' }}>최대 인원</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>6인</p>
          </div>
          <button style={{
            backgroundColor: '#61C56C',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
          }}>
            전화하기
          </button>
        </div>
        <div style={{
          marginTop: '16px',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <img src="/images/map.png" alt="Map" style={{ width: '100%', height: 'auto' }} />
          <p style={{
            margin: '8px 0 0',
            fontSize: '14px',
            textAlign: 'center',
            color: '#8E8D8D',
          }}>
            판교 분당에서 차로 15분 | 경기도 용인시 수지구 성복2로 376
          </p>
        </div>
      </div>
    );
  };


  export default StoreInfo;
  