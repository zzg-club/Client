'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import Navbar from '@/components/Navigate/NavBar'
import styles from '@/app/place/styles/Home.module.css'
import ImageLoader from '@/components/Place/ImageLoader'; // ImageLoader 경로는 프로젝트 구조에 맞게 수정



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

   // 좋아요 상태 확인 함수
   const fetchLikedState = async (placeId: string) => {
    try {
      const response = await fetch(`https://api.moim.team/api/places/places/${placeId}/liked`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch like status for placeId ${placeId}`);
      }
      const data = await response.json();
      return data.liked; // API 응답에서 liked 상태 반환
    } catch (error) {
      console.error('Error fetching like state:', error);
      return false;
    }
  };

  const toggleLike = async (placeId: number, liked: boolean) => {
    try {
      const url = liked
        ? `https://api.moim.team/api/places/unlike`
        : `https://api.moim.team/api/places/like`;
  
      console.log('Place ID:', placeId, 'Type:', typeof placeId); // 값과 타입 확인
  
      // URL 인코딩된 데이터 생성
      const body = new URLSearchParams();
      body.append('placeId', placeId.toString()); // placeId를 문자열로 변환하여 추가
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // 쿠키 포함
        body: body.toString(), // URL 인코딩된 문자열을 본문으로 설정
      });
  
      if (!response.ok) {
        throw new Error(`Failed to toggle like status for placeId ${placeId}`);
      }
  
      return !liked; // 반대 상태 반환
    } catch (error) {
      console.error('Error toggling like:', error);
      return liked; // 실패 시 기존 상태 유지
    }
  };
    

  const fetchUserInformation = async () => {
    try {
      const response = await fetch('https://api.moim.team/api/user/information', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user information:', error);
      return null;
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserInformation();
        setUserName(data.data.userNickname || '알 수 없는 사용자');
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    };
  
    fetchData();
  }, []);


  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }   

  const handleTabClick = async (tabId: string) => {
    // 탭 변경
    setSelectedTab(tabId);
    setSelectedFilters([]); // 필터 초기화
  
    const categoryIndex = tabs.findIndex((tab) => tab.id === tabId);
  
    if (categoryIndex !== -1) {
      try {
        const response = await fetch(
          `https://api.moim.team/api/places/category/${categoryIndex}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.ok) {
          const result = await response.json();
  
          // 좋아요 상태 확인 요청
          const updatedData = await Promise.all(
            (result.data || []).map(async (card: any) => {
              const likeResponse = await fetch(
                `https://api.moim.team/api/places/places/${card.id}/liked`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include', // 쿠키 포함
                }
              );
  
              const likeResult = likeResponse.ok ? await likeResponse.json() : { liked: false };
  
              return {
                ...card,
                filters: card.filters || {}, // filters가 없으면 빈 객체로 초기화
                liked: likeResult.liked || false, // 좋아요 상태 추가
              };
            })
          );
  
          setCardData(updatedData); // 카드 데이터 업데이트
        } else {
          console.error(`Failed to fetch card data. Status code: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching card data:', error);
      }
    } else {
      console.warn('Invalid tabId provided:', tabId);
    }
  };  

  const handleFilterButtonClick = (filter: string) => {
    setSelectedFilters(
      (prevSelected) =>
        prevSelected.includes(filter)
          ? prevSelected.filter((item) => item !== filter) // 이미 선택된 경우 해제
          : [...prevSelected, filter], // 새로 선택
    )
  }

  const handleLikeButtonClick = async (placeId: number, liked: boolean) => {
    const updatedLiked = await toggleLike(placeId, liked);
    setCardData((prev) =>
      prev.map((card) =>
        card.id === placeId ? { ...card, liked: updatedLiked } : card
      )
    );
  };
  

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
          'https://api.moim.team/api/places/filter',
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
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

