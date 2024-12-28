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
      {/* 검색창과 버튼 */}
      <div className="search-container">
        <div className="search-bar">
          <img src="/search.svg" alt="search" className="search-icon" />
          <input type="text" placeholder="원하는 곳을 검색해봐요!" />
        </div>
        <button className="vector-button">
          <img
            src="/vector.svg"
            alt="vector"
            className="vector-icon"
          />
        </button>
      </div>

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

        /* 검색창과 버튼 컨테이너 */
        .search-container {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center; /* 세로 가운데 정렬 */
          gap: 8px;
          z-index: 10;
        }

        /* 검색창 스타일 */
        .search-bar {
          display: flex;
          align-items: center;
          width: 312px; /* 가로 크기 */
          height: 42px; /* 세로 크기 */
          background: white;
          border-radius: 16px; /* border-radius 16px */
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          padding: 9px 16px;
        }

        .search-icon {
          width: 24px;
          height: 24px;
        }

        .search-bar input {
          flex: 1; /* 남은 공간을 모두 차지 */
          border: none;
          outline: none;
          font-size: 18px; /* 텍스트 크기 18px */
          padding: 0 0 0 8px; 
        }

        /* 오른쪽 버튼 스타일 */
        .vector-button {
          width: 42px; /* 버튼 크기 */
          height: 42px; /* 버튼 크기 */
          background: white;
          border: none;
          border-radius: 16px; /* border-radius 16px */
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center; /* 이미지 수직 가운데 정렬 */
          justify-content: center; /* 이미지 가로 가운데 정렬 */
          cursor: pointer;
        }

        .vector-icon {
          width: 32px; /* 이미지 크기 */
          height: 32px; /* 이미지 크기 */
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
