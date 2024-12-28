'use client'

import React, { useState } from 'react'
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

  const places: Place[] = [
    { name: '풍경 한우', lat: 37.5665, lng: 126.978 },
    { name: '서울 카페', lat: 37.5675, lng: 126.979 },
    { name: '코인노래방', lat: 37.5655, lng: 126.977 },
  ]

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles['search-container']}>
        <div className={styles['search-bar']}>
          <img
            src="/search.svg"
            alt="search"
            className={styles['search-icon']}
          />
          <input type="text" placeholder="원하는 곳을 검색해봐요!" />
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
