'use client'

import React from 'react'
import styles from '@/app/search/styles/SearchBar.module.css' // CSS 모듈 임포트

export default function SearchPage() {
  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.searchBar}>
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          className={styles.arrowIcon}
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
      <button className={styles.locationButton}>
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
