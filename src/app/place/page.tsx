'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css'
import ImageLoader from '@/components/Place/ImageLoader'; // ImageLoader 경로는 프로젝트 구조에 맞게 수정
import { fetchFilters } from '@/app/api/places/filter/route'
import { fetchCategoryData } from '@/app/api/places/category/[categoryIndex]/route'
import { fetchLikedStates } from '@/app/api/places/liked/route'
import { fetchUserInformation } from '@/app/api/user/information/route'
import { toggleLike } from '@/app/api/places/like/route'



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
  const [userName, setUserName] = useState('');
  

  const handleLikeButtonClick = async (placeId: number, liked: boolean) => {
    try {
      const updatedLiked = await toggleLike(placeId, liked);
      setCardData((prev) =>
        prev.map((card) =>
          card.id === placeId ? { ...card, liked: updatedLiked } : card
        )
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };
  

  useEffect(() => {
    const loadUserInformation = async () => {
      const userInfo = await fetchUserInformation();
      if (userInfo) {
        console.log('User Information:', userInfo);
        setUserName(userInfo.data?.userNickname || '알 수 없는 사용자');
      } else {
        console.warn('Failed to load user information.');
      }
    };
  
    loadUserInformation();
  }, []);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }   

  const handleTabClick = async (tabId: string) => {
    setSelectedTab(tabId);
    setSelectedFilters([]); // 필터 초기화
  
    const categoryIndex = tabs.findIndex((tab) => tab.id === tabId);
  
    if (categoryIndex === -1) {
      console.warn('Invalid tabId provided:', tabId);
      return;
    }
  
    try {
      // 카테고리 데이터 가져오기
      const categoryData = await fetchCategoryData(categoryIndex);
  
      // 좋아요 상태 확인 및 데이터 업데이트
      const updatedData = await Promise.all(
        categoryData.map(async (card: any) => {
          const liked = await fetchLikedStates(card.id);
          return {
            ...card,
            filters: card.filters || {}, // filters가 없으면 빈 객체로 초기화
            liked, // 좋아요 상태 추가
          };
        })
      );
  
      setCardData(updatedData); // 카드 데이터 업데이트
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };
  
  useEffect(() => {
    handleTabClick(selectedTab);
  }, []);
    

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
    const loadFilters = async () => {
      try {
        const response = await fetchFilters(); // 분리된 함수 호출
        const { success, data, error } = await response.json(); // 응답 처리

        if (success && Array.isArray(data)) {
          setFilters(data); // 상태 업데이트
        } else {
          console.error('Failed to fetch filters:', error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    loadFilters(); // 필터 데이터 로드
  }, []);


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
            <span className={styles.highlight}>{userName}</span>님을 위해 선배들이 픽 했어요!
          </div>
          <div className={styles.content}>
            {cardData.map((card) => (
              <div key={card.id} className={styles.card}>
                <div className={styles.cardImage}>
                  <ImageLoader
                    imageUrl={card.pictures?.[0] || ''}
                    fallbackUrl="/default-cafe.jpg"
                    alt={card.name || '카드 이미지'}
                  />
                </div>
                {/* 카드 내용 */}
                <div className={styles.cardContent}>
                  {/* 카드 헤더 */}
                  <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    {truncateText(card.name || '제목 없음', 25)} {/* 가게명 말줄임표 */}
                  </h3>
                    <div className={styles.likes}>
                      <div className={`${styles.likeBackground} ${card.liked ? styles.liked : ''}`} onClick={() => handleLikeButtonClick(card.id, card.liked)}>
                          <div className={styles.likeIcon}></div>
                      </div>
                      <span>{card.likes || 0}명</span>{' '}
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
                    {truncateText(card.word || '설명이 없습니다.', 40, 2)} {/* 줄당 20글자, 최대 2줄 */}
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

