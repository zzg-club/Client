'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css'
import { fetchFilters } from '@/app/api/places/filter/route'
import { fetchCategoryData } from '@/app/api/places/category/[categoryIndex]/route'
import { fetchLikedStates } from '@/app/api/places/liked/route'
import { fetchUserInformation } from '@/app/api/user/information/route'
import { toggleLike } from '@/app/api/places/like/route'
import { fetchFilteredCategoryData } from '@/app/api/places/category/[categoryIndex]/route' // 필터 데이터 API
import { fetchLikeCount } from '../api/places/updateLike/route'

interface Place {
  lat: number
  lng: number
  name: string
}

interface FilterResponse {
  category: string
  filters: Record<string, string>
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
  const [userName, setUserName] = useState('')

  const handleCardClick = (placeId: number) => {
    router.push(`/place/${placeId}`); // 클릭한 카드의 ID로 이동
  };

  const handleLikeButtonClick = async (placeId: number, liked: boolean) => {
    try {
      // 좋아요 상태 토글
      const updatedLiked = await toggleLike(placeId, liked)

      // 최신 좋아요 개수 가져오기
      const updatedLikesCount = await fetchLikeCount(placeId)

      // 카드 데이터 업데이트 (좋아요 상태 + 좋아요 개수)
      setCardData((prev) =>
        prev.map((card) =>
          card.id === placeId
            ? { ...card, liked: updatedLiked, likes: updatedLikesCount }
            : card,
        ),
      )
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  useEffect(() => {
    const loadUserInformation = async () => {
      const userInfo = await fetchUserInformation()
      if (userInfo) {
        console.log('User Information:', userInfo)
        setUserName(userInfo.data?.userNickname || '알 수 없는 사용자')
      } else {
        console.warn('Failed to load user information.')
      }
    }

    loadUserInformation()
  }, [])

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const handleTabClick = async (tabId: string) => {
    setSelectedTab(tabId)
    setSelectedFilters([]) // 필터 초기화

    const categoryIndex = tabs.findIndex((tab) => tab.id === tabId)

    if (categoryIndex === -1) {
      console.warn('Invalid tabId provided:', tabId)
      return
    }

    try {
      let data

      if (selectedFilters.length === 0) {
        // 필터가 선택되지 않았을 때 기본 데이터를 가져옵니다.
        console.log(
          'Fetching default category data for categoryIndex:',
          categoryIndex,
        )
        data = await fetchCategoryData(categoryIndex)
      } else {
        // 선택된 필터를 기반으로 필터링된 데이터를 가져옵니다.
        const filters = getCurrentTabFilters().reduce(
          (acc, filter, index) => {
            acc[`filter${index + 1}`] = selectedFilters.includes(filter) // 선택된 필터를 boolean으로 변환
            return acc
          },
          {} as {
            filter1?: boolean
            filter2?: boolean
            filter3?: boolean
            filter4?: boolean
          },
        )

        console.log('Fetching filtered category data with filters:', filters)
        data = await fetchFilteredCategoryData(categoryIndex, filters)
      }

      // 좋아요 상태 확인 및 데이터 업데이트
      const updatedData = await Promise.all(
        data.map(async (card: any) => {
          const liked = await fetchLikedStates(card.id)
          return {
            ...card,
            filters: card.filters || {}, // filters가 없으면 빈 객체로 초기화
            liked, // 좋아요 상태 추가
          }
        }),
      )

      console.log('Updated card data:', updatedData)
      setCardData(updatedData) // 카드 데이터 업데이트
    } catch (error) {
      console.error('Error fetching category data:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const categoryIndex = tabs.findIndex((tab) => tab.id === selectedTab)

      if (categoryIndex === -1) {
        console.warn('Invalid tabId provided:', selectedTab)
        return
      }

      try {
        let data

        if (selectedFilters.length === 0) {
          // 필터가 선택되지 않았을 때 기본 데이터를 가져옵니다.
          console.log(
            'Fetching default category data for categoryIndex:',
            categoryIndex,
          )
          data = await fetchCategoryData(categoryIndex)
        } else {
          try {
            const filters = getCurrentTabFilters().reduce(
              (acc, filter, index) => {
                acc[`filter${index + 1}`] = selectedFilters.includes(filter) // 선택된 필터를 boolean으로 변환
                return acc
              },
              {} as {
                filter1?: boolean
                filter2?: boolean
                filter3?: boolean
                filter4?: boolean
              },
            )

            console.log(
              'Fetching filtered category data with filters:',
              filters,
            )

            data = await fetchFilteredCategoryData(categoryIndex, filters)

            if (!data || data.length === 0) {
              console.warn(
                'No data returned for the selected filters:',
                filters,
              )
              data = [] // 기본값으로 빈 배열 설정
            }
          } catch (error) {
            console.error('Error fetching filtered category data:', error)
            data = [] // 예외 발생 시 빈 배열 설정
          }
        }

        // 좋아요 상태 확인 및 데이터 업데이트
        const updatedData = await Promise.all(
          data.map(async (card: any) => {
            const liked = await fetchLikedStates(card.id)
            return {
              ...card,
              filters: card.filters || {}, // filters가 없으면 빈 객체로 초기화
              liked, // 좋아요 상태 추가
            }
          }),
        )

        console.log('Updated card data:', updatedData)
        setCardData(updatedData) // 카드 데이터 업데이트
      } catch (error) {
        console.error('Error fetching category data:', error)
      }
    }

    fetchData()
  }, [selectedTab, selectedFilters]) // 탭 상태 및 필터 상태가 변경될 때 호출

  useEffect(() => {
    handleTabClick(selectedTab)
  }, [])

  const handleFilterButtonClick = (filter: string) => {
    setSelectedFilters((prevSelected) => {
      const updatedFilters = prevSelected.includes(filter)
        ? prevSelected.filter((item) => item !== filter) // 이미 선택된 경우 해제
        : [...prevSelected, filter] // 새로 선택

      console.log('Updated Filters:', updatedFilters) // 선택된 필터 로그
      return updatedFilters
    })
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
    const loadFilters = async () => {
      try {
        const response = await fetchFilters() // 분리된 함수 호출
        const { success, data, error } = await response.json() // 응답 처리

        if (success && Array.isArray(data)) {
          setFilters(data) // 상태 업데이트
        } else {
          console.error('Failed to fetch filters:', error || 'Unknown error')
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    loadFilters() // 필터 데이터 로드
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
            <span className={styles.highlight}>{userName}</span>님을 위해
            선배들이 픽 했어요!
          </div>
          <div className={styles.content}>
            {cardData.map((card) => (
              <div key={card.id} className={styles.card} onClick={() => handleCardClick(card.id)}>
                <div className={styles.cardImage}>
                  {card.pictures?.[0] ? (
                    <img
                      src={card.pictures[0] || '/default-cafe.jpg'}
                      alt={card.name || '카드 이미지'}
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="/default-cafe.jpg"
                      alt={card.name || '기본 이미지'}
                      className={styles.cardImage} // 필요한 스타일 추가
                    />
                  )}
                </div>
                {/* 카드 내용 */}
                <div className={styles.cardContent}>
                  {/* 카드 헤더 */}
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>
                      {truncateText(card.name || '제목 없음', 25)}{' '}
                      {/* 가게명 말줄임표 */}
                    </h3>
                    <div className={styles.likes}>
                      <div
                        className={`${styles.likeBackground} ${card.liked ? styles.liked : ''}`}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleLikeButtonClick(card.id, card.liked)
                        }}
                      >
                        <div className={styles.likeIcon}></div>
                      </div>
                      <span>{card.likes || 0}명</span> {/* 좋아요 숫자 */}
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
                    {truncateText(card.word || '설명이 없습니다.', 40, 2)}{' '}
                    {/* 줄당 20글자, 최대 2줄 */}
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
        </div>
      </div>
    </div>
  )
}
