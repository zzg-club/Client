'use client';

import { useState } from 'react';
import KakaoMap from '@/components/Map/KakaoMap';

interface Place {
  lat: number;
  lng: number;
  name: string;
}

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const places: Place[] = [
    { name: '풍경 한우', lat: 37.5665, lng: 126.978 },
    { name: '서울 카페', lat: 37.5675, lng: 126.979 },
    { name: '코인노래방', lat: 37.5655, lng: 126.977 },
  ];

  return (
    <div className="container">
      {/* 검색창 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="원하는 곳을 검색해보세요!"
        />
      </div>

      {/* 오른쪽 버튼 */}
      <button className="vector-button">
        <img
          src="/vector.svg"
          alt="vector"
          style={{
            width: '32px',
            height: '32px',
            padding: '0 8px 0 16px',
          }}
        />
      </button>

      {/* 지도 */}
      <KakaoMap selectedPlace={selectedPlace} />


      <style jsx>{`
        .container {
          font-family: Arial, sans-serif;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          position: relative;
        }

        /* 검색창 스타일 */
        .search-bar {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 60px; /* 오른쪽 버튼과 겹치지 않도록 여백 */
          background: white;
          border-radius: 25px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          padding: 5px 15px;
          z-index: 10; /* 지도 위에 표시 */
        }

        .search-bar input {
          width: 100%;
          border: none;
          outline: none;
          padding: 10px;
          font-size: 18px;
          border-radius: 25px;
        }

        /* 오른쪽 버튼 스타일 */
        .vector-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: white;
          border: none;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          cursor: pointer;
        }

        .vector-button img {
          display: block;
        }

        /* 하단 장소 버튼 */
        .places {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10; /* 지도 위에 표시 */
        }

        .places button {
          padding: 10px 20px;
          background: #6200ea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .places button:hover {
          background: #5300d6;
        }
      `}</style>
    </div>
  );
}
