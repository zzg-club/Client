'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css'

interface Place {
  lat: number
  lng: number
  name: string
}

interface FilterResponse {
  category: string
  filters: Record<string, string> // filter1, filter2, ...
}

const tabs = [
  { id: 'food', label: '음식점' },
  { id: 'cafe', label: '카페' },
  { id: 'play', label: '놀이' },
  { id: 'campus', label: '캠퍼스' },
]

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [bottomSheetState, setBottomSheetState] = useState<
    'collapsed' | 'middle' | 'expanded'
  >('collapsed')
  const [filters, setFilters] = useState<FilterResponse[]>([]) // 필터 데이터를 저장
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].id)
  const startY = useRef<number | null>(null)
  const currentY = useRef<number | null>(null)
  const threshold = 50
  const router = useRouter()
  const mapRef = useRef<() => void | null>(null)

  const handleVectorButtonClick = () => {
    if (mapRef.current) {
      mapRef.current() // KakaoMap의 moveToCurrentLocation 호출
    }
  }

  const handleSearchClick = () => {
    router.push('/search?from=/place')
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

      if (delta > threshold) {
        // 확장 상태로 변경
        setBottomSheetState((prevState) =>
          prevState === 'collapsed' ? 'middle' : 'expanded',
        )
      } else if (delta < -threshold) {
        // 축소 상태로 변경
        setBottomSheetState((prevState) =>
          prevState === 'expanded' ? 'middle' : 'collapsed',
        )
      }
    }
    startY.current = null
    currentY.current = null
  }

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('http://api.mooim.kro.kr/api/places/filter', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (response.ok) {
          const data: FilterResponse[] = await response.json()
          setFilters(data) // 상태 업데이트
          console.log("상태업데이트 완료!")
        } else {
          console.error('Failed to fetch filters:', response.status)
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

   // 선택된 탭에 맞는 필터 가져오기
  const getCurrentTabFilters = () => {
    const currentCategory = tabs.find((tab) => tab.id === selectedTab)?.label
    const categoryFilters = filters.find((filter) => filter.category === currentCategory)
    return categoryFilters ? Object.values(categoryFilters.filters) : []
  }

  return (
    <div className={styles['mobile-container']}>
      <Navbar activeTab="플레이스" />
      <div className={styles['search-container']}>
        <div
          className={styles['search-bar']}
          onClick={handleSearchClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src="/search.svg"
            alt="search"
            className={styles['search-icon']}
          />
          <input type="text" placeholder="원하는 곳을 검색해봐요!" readOnly />
        </div>
        <button
          className={styles['vector-button']}
          onClick={handleVectorButtonClick}
        >
          <img
            src="/vector.svg"
            alt="vector"
            className={styles['vector-icon']}
          />
        </button>
      </div>
      <KakaoMap
        selectedPlace={selectedPlace}
        onMoveToCurrentLocation={(moveToCurrentLocation) =>
          (mapRef.current = moveToCurrentLocation)
        }
      />

      {/* Tabs */}
      <div className={`${styles.tabs} ${styles[bottomSheetState]}`}>
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
        className={`${styles.bottomSheet} ${styles[bottomSheetState]}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.dragHandle}></div>
        <div className={styles.content}>
          {/* Dynamic Buttons */}
          <div className={styles.buttonsContainer}>
            {getCurrentTabFilters().map((filter, index) => (
              <button key={index} className={styles.actionButton}>
                {filter}
              </button>
            ))}
          </div>
          <div className={styles.moimPickContainer}>
            <span className={styles.moimPickText}>MOIM-Pick</span>
            <div className={styles.moimPickLine}></div>
          </div>
          <div className={styles.moimPickSubText}>
            <span className={styles.highlight}>박진우</span>님을 위해 선배들이
            픽 했어요!
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
                <img
                  src="/clock-icon.svg"
                  alt="시계 아이콘"
                  className={styles.clockIcon}
                />
                <span>영업시간 00:00 - 24:00</span>
              </div>
            </div>
          </div>
          <div className={styles.bottomSheetLine}></div>
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
                <img
                  src="/clock-icon.svg"
                  alt="시계 아이콘"
                  className={styles.clockIcon}
                />
                <span>영업시간 00:00 - 24:00</span>
              </div>
            </div>
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
                <img
                  src="/clock-icon.svg"
                  alt="시계 아이콘"
                  className={styles.clockIcon}
                />
                <span>영업시간 00:00 - 24:00</span>
              </div>
            </div>
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
                <img
                  src="/clock-icon.svg"
                  alt="시계 아이콘"
                  className={styles.clockIcon}
                />
                <span>영업시간 00:00 - 24:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
