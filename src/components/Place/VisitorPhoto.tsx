'use client';

import React from 'react';


const VisitorPhoto = () => {
    const photos = [
      '/images/photo1.png', '/images/photo2.png', '/images/photo3.png',
      '/images/photo4.png', '/images/photo5.png', '/images/photo6.png',
      '/images/photo7.png', '/images/photo8.png', '/images/photo9.png',
    ];
  
    return (
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#9562FB',
          borderBottom: '2px solid #9562FB',
          display: 'inline-block',
        }}>
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {photos.map((photo, index) => (
            <div key={index} style={{
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <img src={photo} alt={`Visitor ${index}`} style={{ width: '100%', height: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default VisitorPhoto;
  