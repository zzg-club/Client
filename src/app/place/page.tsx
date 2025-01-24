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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [cardData, setCardData] = useState<any[]>([]) // 카드 데이터를 저장

  const handleTabClick = async (tabId: string) => {
    // 탭 변경
    setSelectedTab(tabId)
    setSelectedFilters([]) // 필터 초기화

    const categoryIndex = tabs.findIndex((tab) => tab.id === tabId)

    if (categoryIndex !== -1) {
      try {
        const response = await fetch(
          `http://api.mooim.kro.kr/api/places/category/${categoryIndex}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        )

        if (response.ok) {
          const result = await response.json()

          // 데이터 정규화 (filters가 없는 경우 기본값 처리)
          const normalizedData = (result.data || []).map((card: any) => ({
            ...card,
            filters: card.filters || {}, // filters가 없으면 빈 객체로 초기화
          }))

          setCardData(normalizedData) // 카드 데이터 업데이트
        } else {
          console.error(
            `Failed to fetch card data. Status code: ${response.status}`,
          )
        }
      } catch (error) {
        console.error('Error fetching card data:', error)
      }
    } else {
      console.warn('Invalid tabId provided:', tabId)
    }
  }

  const handleFilterButtonClick = (filter: string) => {
    setSelectedFilters(
      (prevSelected) =>
        prevSelected.includes(filter)
          ? prevSelected.filter((item) => item !== filter) // 이미 선택된 경우 해제
          : [...prevSelected, filter], // 새로 선택
    )
  }

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
        const response = await fetch(
          'http://api.mooim.kro.kr/api/places/filter',
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        )
        if (response.ok) {
          const result = await response.json()
          console.log('API 응답 데이터:', result) // 디버깅용
          if (result.success && Array.isArray(result.data)) {
            setFilters(result.data) // 상태 업데이트
          } else {
            console.error('유효하지 않은 데이터 형식:', result)
          }
        } else {
          console.error('Failed to fetch filters:', response.status)
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

  const getCurrentTabFilters = () => {
    const currentCategory = tabs.find((tab) => tab.id === selectedTab)?.label
    const categoryFilters = filters.find(
      (filter) => filter.category === currentCategory,
    )

    if (!categoryFilters || !categoryFilters.filters) {
      return []
    }

    return Object.values(categoryFilters.filters) // ["24시", "학교", "주점", "룸"]
  }

  const getCardFiltersWithNames = (
    cardData: Record<string, any>, // 카드 데이터 전체
    currentFilters: string[], // 현재 탭의 필터 이름 배열
  ) => {
    // 1. `filter1`, `filter2` 등 필터 관련 키만 추출
    const trueFilters = Object.entries(cardData)
      .filter(([key, value]) => key.startsWith('filter') && value === true) // "filterX" && true인 경우
      .map(([key]) => key) // 필터 키 이름 ("filter1", "filter2")

    // 2. 필터 이름 매칭
    const filterNames = trueFilters.map((filterKey) => {
      const index = parseInt(filterKey.replace('filter', ''), 10) - 1 // filter1 → 0
      return currentFilters[index] // 현재 탭 필터 이름과 매칭
    })

    return filterNames.filter(Boolean) // undefined 제거
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
              selectedTab === tab.id ? styles.selectedTab : ''
            }`}
            onClick={() => handleTabClick(tab.id)}
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
              <button
                key={index}
                className={`${styles.actionButton} ${
                  selectedFilters.includes(filter) ? styles.selected : ''
                }`}
                onClick={() => handleFilterButtonClick(filter)}
              >
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
          <div className={styles.content}>
            {cardData.map((card) => (
              <div key={card.id} className={styles.card}>
                {/* 카드 이미지 */}
                <div className={styles.cardImage}>
                  <img
                    src={card.pictures?.[0]?.url || '/sample-cafe.svg'} // 첫 번째 이미지를 사용하거나 기본 이미지 사용
                    alt={card.name || '카드 이미지'}
                  />
                </div>

                {/* 카드 내용 */}
                <div className={styles.cardContent}>
                  {/* 카드 헤더 */}
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      {card.name || '제목 없음'}
                    </h3>
                    <div className={styles.likes}>
                      <div className={styles.likeBackground}>
                        <div className={styles.likeIcon}></div>
                      </div>
                      <span>{card.likes.length || 0}명</span>{' '}
                      {/* 좋아요 숫자 */}
                    </div>
                  </div>

                  {/* 태그 (true 값만 렌더링) */}
                  <div className={styles.tags}>
                    {getCardFiltersWithNames(card, getCurrentTabFilters()).map(
                      (filterName, index) => (
                        <span key={index} className={styles.tag}>
                          {filterName}
                        </span>
                      ),
                    )}
                  </div>

                  {/* 설명 */}
                  <div className={styles.description}>
                    {card.word || '설명이 없습니다.'}
                  </div>

                  {/* 운영 시간 */}
                  <div className={styles.footer}>
                    <img
                      src="/clock-icon.svg"
                      alt="시계 아이콘"
                      className={styles.clockIcon}
                    />
                    <span>영업시간 {card.time || '정보 없음'}</span>
                  </div>
                </div>
              </div>
            ))}
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
