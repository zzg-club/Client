'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // useRouter 훅 사용
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/Navbar'
import styles from '@/app/place/styles/Home.module.css' // CSS 모듈 임포트

interface Place {
  lat: number
  lng: number
  name: string
}

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const router = useRouter() // Next.js 라우터 훅

  const places: Place[] = [
    { name: '풍경 한우', lat: 37.5665, lng: 126.978 },
    { name: '서울 카페', lat: 37.5675, lng: 126.979 },
    { name: '코인노래방', lat: 37.5655, lng: 126.977 },
  ]

  const handleSearchClick = () => {
    // 검색창 클릭 시 페이지 이동
    router.push('/search') // '/search' 페이지로 이동
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles['search-container']}>
        <div
          className={styles['search-bar']}
          onClick={handleSearchClick} // 클릭 이벤트 추가
          style={{ cursor: 'pointer' }} // 클릭 가능한 UI 표시
        >
          <img
            src="/search.svg"
            alt="search"
            className={styles['search-icon']}
          />
          <input
            type="text"
            placeholder="원하는 곳을 검색해봐요!"
            readOnly // 검색창 입력 비활성화 (클릭만 가능하게)
          />
        </div>
        <button className={styles['vector-button']}>
          <img
            src="/vector.svg"
            alt="vector"
            className={styles['vector-icon']}
          />
        </button>
      </div>
      <KakaoMap selectedPlace={selectedPlace} />
    </div>
  )
}
