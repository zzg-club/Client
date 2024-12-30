'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css'

interface Place {
  lat: number
  lng: number
  name: string
}

const tabs = [
  { id: 'food', label: '음식점' },
  { id: 'cafe', label: '카페' },
  { id: 'play', label: '놀이' },
]

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].id)
  const startY = useRef<number | null>(null)
  const currentY = useRef<number | null>(null)
  const threshold = 50
  const router = useRouter()

  const handleSearchClick = () => {
    router.push('/search')
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
  }

  const handleTouchEnd = () => {
    if (startY.current !== null && currentY.current !== null) {
      const delta = startY.current - currentY.current
      if (delta > threshold) setIsExpanded(true)
      else if (delta < -threshold) setIsExpanded(false)
    }
    startY.current = null
    currentY.current = null
  }

  return (
    <div className={styles['mobile-container']}>
      <Navbar />
      <div className={styles['search-container']}>
        <div
          className={styles['search-bar']}
          onClick={handleSearchClick}
          style={{ cursor: 'pointer' }}
        >
          <img src="/search.svg" alt="search" className={styles['search-icon']} />
          <input type="text" placeholder="원하는 곳을 검색해봐요!" readOnly />
        </div>
        <button className={styles['vector-button']}>
          <img src="/vector.svg" alt="vector" className={styles['vector-icon']} />
        </button>
      </div>
      <KakaoMap selectedPlace={selectedPlace} />

      {/* Tabs */}
      <div
        className={`${styles.tabs} ${isExpanded ? styles.expandedTabs : ''}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              selectedTab === tab.id ? styles.selected : ''
            }`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bottom Sheet */}
      <div
        className={`${styles.bottomSheet} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.dragHandle}></div>
        <div className={styles.content}>
          {/* Dynamic Buttons */}
          <div className={styles.buttonsContainer}>
            {selectedTab === 'food' &&
              ['24시', '학교', '주점', '룸'].map((button, index) => (
                <button key={index} className={styles.actionButton}>
                  {button}
                </button>
              ))}
            {selectedTab === 'cafe' &&
              ['24시', '학교', '스터디', '콘센트'].map((button, index) => (
                <button key={index} className={styles.actionButton}>
                  {button}
                </button>
              ))}
            {selectedTab === 'play' &&
              ['노래방', 'PC방', '볼링장', '당구장', '파티룸'].map(
                (button, index) => (
                  <button key={index} className={styles.actionButton}>
                    {button}
                  </button>
                )
              )}
          </div>
          <div className={styles.moimPickContainer}>
            <span className={styles.moimPickText}>MOIM-Pick</span>
            <div className={styles.moimPickLine}></div>
          </div>
          <div className={styles.moimPickSubText}>
            <span className={styles.highlight}>박진우</span>님을 위해 선배들이 픽 했어요!
          </div>
          <div className={styles.card}>
            <div className={styles.cardImage}>
              <img src="/sample-cafe.svg" alt="카페 이미지" />
            </div>
            <div className={styles.cardContent}>
              {/* 카드 헤더 */}
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>서울 공덕 구로토</h3>
                <div className={styles.likes}>
                  <div className={styles.likeBackground}>
                    <div className={styles.likeIcon}></div>
                  </div>
                  <span>323명</span>
                </div>
              </div>

              {/* 태그 */}
              <div className={styles.tags}>
                <span className={styles.tag}>24시</span>
                <span className={styles.tag}>학교</span>
              </div>

              {/* 설명 */}
              <div className={styles.description}>
                "인테리어가 신선하고 사진 찍기 딱 좋더라, 꼭 가봐!✨"
              </div>

              {/* 푸터 */}
              <div className={styles.footer}>
                <img src="/clock-icon.svg" alt="시계 아이콘" className={styles.clockIcon} />
                <span>영업시간 00:00 - 24:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
