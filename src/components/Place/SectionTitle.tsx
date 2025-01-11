'use client';

import React from 'react';

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        marginTop: '2px',
        padding: '0px 14px', 
      }}
    >
      <h2
        style={{
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '17px',
          letterSpacing: '-0.5px',
          color: '#9562FB',
          margin: 0,
          marginRight: '7px', // 텍스트와 선 사이 간격
          marginLeft:'10px'
        }}
      >
        {title}
      </h2>
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: '#9562FB',
          marginTop: '14px',
          marginRight: '20px', // 텍스트와 선 사이 간격
        }}
      ></div>
    </div>
  );
};

export default SectionTitle;
