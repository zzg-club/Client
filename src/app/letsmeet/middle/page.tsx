'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // useRouter 훅 사용
import { usePathname } from 'next/navigation' // 현재 경로 확인 훅
import KakaoMap from '@/components/Map/KakaoMap'
import NavBar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css' // CSS 모듈 임포트

interface Middle {
  lat: number
  lng: number
  name: string
}

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Middle | null>(null)
  const router = useRouter() // Next.js 라우터 훅
  const pathname = usePathname() // 현재 경로 가져오기

  const handleSearchClick = () => {
    router.push('/search')
  }

  return (
    <div className={styles.container}>
      {/* 네비게이션 바: 특정 경로에서 숨기기 */}
      {pathname !== '/search' && <NavBar />}

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
        <button className={styles['vector-button']} onClick={handleSearchClick}>
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
