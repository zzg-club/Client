'use client'

import React from 'react'
import { useRouter } from 'next/navigation' // useRouter 훅 사용
import styles from '@/app/search/styles/SearchBar.module.css' // CSS 모듈 임포트

export default function SearchPage() {
  const router = useRouter() // Next.js 라우터 훅

  const handleLocationClick = () => {
    // 내 위치 불러오기 버튼 클릭 시 location 페이지로 이동
    router.push('/search/location')
  }

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.searchBar}>
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          className={styles.arrowIcon}
          onClick={() => router.push('/place')} // 클릭 시 'place' 페이지로 이동
        />
        <div className={styles.searchInputContainer}>
          <img
            src="/search.svg"
            alt="돋보기 아이콘"
            className={styles.searchIcon}
          />
          <input
            type="text"
            placeholder="원하는 곳을 입력하세요!"
            className={styles.searchInput}
            readOnly
          />
        </div>
        <button className={styles.searchButton}>검색</button>
      </div>
      {/* 내 위치 불러오기 버튼 */}
      <button
        className={styles.locationButton}
        onClick={handleLocationClick} // 클릭 이벤트 추가
      >
        <img
          src="/vector.svg"
          alt="위치 아이콘"
          className={styles.locationIcon}
        />
        내 위치 불러오기
      </button>
    </div>
  )
}
