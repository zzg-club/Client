'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/Navbar'
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
        </div>
      </div>
    </div>
  )
}
