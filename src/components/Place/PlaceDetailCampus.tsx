'use client'

import React, { useState, useRef, useEffect } from 'react'
import KakaoMap from '@/components/Map/KakaoMap'
import styles from '@/app/place/styles/Detail.module.css'
import { Place } from '@/types/place'
import StoreInfoCampus from '@/components/Place/StoreInfoCampus'
import VisitorPhoto from '@/components/Place/VisitorPhoto'
import SectionTitle from '@/components/Place/SectionTitle'
import { fetchFilters } from '@/app/api/places/filter/route'
import { fetchLikedStates } from '@/app/api/places/liked/route'
import { fetchLikeCount } from '@/app/api/places/updateLike/route'
import { toggleLike } from '@/app/api/places/like/route'

interface PlaceDetailProps {
  placeData: Place
}

const PlaceDetailCampus = ({ placeData }: PlaceDetailProps) => {

  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'middle' | 'expanded'>('collapsed')
  const [activeTab, setActiveTab] = useState<'상세' | '메뉴' | '사진'>('상세')
  const startY = useRef<number | null>(null)
  const currentY = useRef<number | null>(null)
  const threshold = 50
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [liked, setLiked] = useState<boolean>(false)
  const [likeCount, setLikeCount] = useState<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  // 좋아요 상태와 개수 가져오기
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likedState = await fetchLikedStates(String(placeData.id)) // 안전하게 변환
        const likes = await fetchLikeCount(Number(placeData.id)) 
        setLiked(likedState)
        setLikeCount(likes)
      } catch (error) {
        console.error('Error fetching like data:', error)
      }
    }

    fetchLikes()
  }, [placeData.id])

  // 활성 필터 가져오기
  useEffect(() => {
    const getActiveFilters = async (category: number, placeData: Place) => {
      try {
        const filterResponse = await fetchFilters()
        const filterData = await filterResponse.json()

        if (!filterData.success || !Array.isArray(filterData.data)) {
          console.error('필터 데이터를 가져오는 데 실패했습니다.')
          return []
        }

        const categoryFilters = filterData.data[category]
        if (!categoryFilters) return []

        const { filters } = categoryFilters
        const activeFilters = Object.keys(filters)
              .filter((key): key is keyof Place => key in placeData && typeof placeData[key as keyof Place] === 'boolean' && placeData[key as keyof Place] === true)
              .map((key) => filters[key]);

        console.log('활성 필터:', activeFilters);

        return activeFilters; 
      } catch (error) {
        console.error('필터 가져오기 오류:', error)
        return []
      }
    }

    const fetchAndSetFilters = async () => {
      const filters = await getActiveFilters(placeData.category, placeData)
      setActiveFilters(filters)
    }

    fetchAndSetFilters()
  }, [placeData])

  // 좋아요 버튼 클릭 이벤트
  const handleLikeButtonClick = async () => {
    try {
      const updatedLiked = await toggleLike(Number(placeData.id), liked)
      const updatedLikeCount = await fetchLikeCount(Number(placeData.id))
      setLiked(updatedLiked)
      setLikeCount(updatedLikeCount)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }


  const getActiveFilters = async (category: number, placeData: Place) => {
    try {
      // /api/places/filter 호출하여 필터 데이터 가져오기
      const filterResponse = await fetchFilters();
      const filterData = await filterResponse.json();
  
      if (!filterData.success || !Array.isArray(filterData.data)) {
        console.error('필터 데이터를 가져오는 데 실패했습니다.');
        return [];
      }
  
      const categoryFilters = filterData.data[category];
  
      if (!categoryFilters) {
        console.warn(`해당 카테고리에 대한 필터가 없습니다: ${category}`);
        return [];
      }
  
      const { filters } = categoryFilters; 

      const activeFilters = Object.keys(filters)
      .filter((key): key is keyof Place => key in placeData && typeof placeData[key as keyof Place] === 'boolean' && placeData[key as keyof Place] === true)
      .map((key) => filters[key]);
  
      console.log('활성 필터:', activeFilters);
      return activeFilters;
    } catch (error) {
      console.error('필터 가져오기 오류:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAndSetFilters = async () => {
      if (!placeData) return;
      const filters = await getActiveFilters(placeData.category, placeData);
      setActiveFilters(filters);
    };
  
    fetchAndSetFilters();
  }, [placeData]);

  // 드래그 시작
  const handleStart = (y: number) => {
    startY.current = y
    isDraggingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
  }

  // 드래그 진행
  const handleMove = (y: number) => {
    if (!isDraggingRef.current || startY.current === null) return
    const deltaY = startY.current - y

    if (deltaY > threshold) {
      // 위로 드래그 (다음 단계로 확장)
      setBottomSheetState((prev) => {
        if (prev === 'collapsed') return 'middle'
        if (prev === 'middle') return 'expanded'
        return 'expanded' // 이미 expanded면 유지
      })
      startY.current = y
    } else if (deltaY < -threshold) {
      // 아래로 드래그 (다음 단계로 축소)
      setBottomSheetState((prev) => {
        if (prev === 'expanded') return 'middle'
        if (prev === 'middle') return 'collapsed'
        return 'collapsed' // 이미 collapsed면 유지
      })
      startY.current = y
    }
  }

  // 드래그 종료
  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientY)
  }

  const handleEnd = () => {
    startY.current = null
    isDraggingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleEnd)
  }


  return (
    <div className={styles['detail-container']}>
      <div className={`${styles['map-container']} ${styles[bottomSheetState]}`}>
        <KakaoMap
          bottomSheetState={bottomSheetState}
          selectedPlace={placeData}
          onMoveToCurrentLocation={() => {}}
        />
        {/* 뒤로가기 버튼 */}
        <div
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          <img
            src="/arrow_back.svg"
            alt="뒤로가기"
            className={styles.backIcon}
          />
        </div>
        {/* 창닫기 버튼 */}
        <div
          className={styles.closeButton}
          onClick={() => window.history.back()}
        >
          <img
            src="/close-button.svg"
            alt="창닫기"
            className={styles.closeIcon}
          />
        </div>
      </div>

      {/* 상단 버튼 (expanded 상태) */}
      {bottomSheetState === 'expanded' && (
        <div className={styles['top-buttons']}>
          <button
            className={styles['top-left-button']}
            // onClick={() => window.history.back()}
          >
            <img
              src="/arrow_back_ios.svg"
              alt="뒤로가기"
              style={{ width: '28px', height: '28px' }}
            />
          </button>
          <button
            className={styles['top-right-button']}
            // onClick={() => window.history.back()}
          >
            <img
              src="/close_ios.svg"
              alt="닫기"
              style={{ width: '28px', height: '28px' }}
            />
          </button>
        </div>
      )}

      {/* BottomSheet 상단(지도 하단) 버튼 */}
      <div
        className={`${styles.bottomSheetTopRightButton} ${styles[bottomSheetState]}`}
      >
        <img
          src="/path.svg"
          alt="Path Icon"
          className={styles.iconInsideButton}
        />
      </div>
      {/* Bottom Sheet */}
      <div
        className={`${styles.bottomSheet} ${styles[bottomSheetState]}`}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientY)}
      >
        <div className={styles.dragHandle}></div>

        {/* Collapsed State Content */}
        {bottomSheetState === 'collapsed' && (
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{placeData.name}</h3>
              <div className={styles.likes}>
              <div
                className={`${styles.likeBackground} ${liked ? styles.liked : ''}`}
                onClick={handleLikeButtonClick}
              >
                <div className={styles.likeIcon}></div>
              </div>
              <span>{likeCount}명</span>
            </div>
            </div>

            <div className={styles.tags}>
              {activeFilters.map((filter, index) => (
                <span key={index} className={styles.tag}>
                  {filter}
                </span>
              ))}
            </div>

            <h3>{placeData.word}</h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '2px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <img
                  src="/clock-icon.svg"
                  alt="Clock Icon"
                  style={{ width: '18px', height: '18px' }}
                />
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#AFAFAF',
                    letterSpacing: '-0.5px',
                  }}
                >
                  영업시간
                </p>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#9562FB',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {placeData.time}
                </p>
              </div>
              <button
                style={{
                  backgroundColor: '#61C56C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  width: '92px',
                  height: '44px',
                }}
              >
                <img
                  src="/call.svg"
                  alt="Call Icon"
                  style={{ width: '36px', height: '36px' }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Middle and Expanded State Content */}
        {['middle', 'expanded'].includes(bottomSheetState) && (
          <>
            <div className={styles['image-gallery']}>
              <div className={styles['gallery-large']}>
                <img
                  src={placeData.pictures[0]}
                  alt="Large Gallery"
                  className={styles['gallery-image']}
                />
              </div>

              <div className={styles['gallery-small-container']}>
                {placeData.pictures.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className={styles['gallery-small']}
                    style={{ position: 'relative' }}
                  >
                    <img
                      src={image}
                      alt={`Small Gallery ${index}`}
                      className={styles['gallery-image']}
                      style={{
                        filter: index === 3 ? 'brightness(35%)' : 'none',
                      }}
                    />
                    {index === 3 && (
                      <div className={styles['more-overlay']}>
                        <img
                          src="/photo_library.svg"
                          alt="Photo Library Icon"
                          className={styles['photo-icon']}
                        />
                        +{placeData.pictures.length - 5}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{placeData.name}</h3>
                  <div className={styles.likes}>
                    <div
                      className={`${styles.likeBackground} ${liked ? styles.liked : ''}`}
                      onClick={handleLikeButtonClick}
                    >
                      <div className={styles.likeIcon}></div>
                    </div>
                    <span>{likeCount}명</span>
                  </div>
                </div>

                <div className={styles.tags}>
                {activeFilters.map((filter, index) => (
                  <span key={index} className={styles.tag}>
                    {filter}
                  </span>
                ))}
                </div>

                <div className={styles.description}>{placeData.word}</div>

                <div className={styles.tabContainer}>
                  {['상세', '사진'].map((tab) => (
                    <div
                      key={tab}
                      className={`${styles.tab} ${activeTab === tab ? styles.selected : ''}`}
                      onClick={() =>
                        setActiveTab(tab as '상세' | '사진')
                      }
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.tabContent}>
              {activeTab === '상세' && (
                <>
                  <div
                    className={styles.cardContainer}
                    style={{ marginBottom: '10px' }}
                  >
                    <StoreInfoCampus selectedPlace={placeData} />
                    {/* <div style={{ marginTop: '40px' }}>
                      <SectionTitle title="인기 메뉴" />
                    </div> 
                    <Menu selectedPlace={placeData} /> */}
                    <div style={{marginTop:'20px'}}>
                      <SectionTitle title="방문자 사진" />
                    </div>
                    <VisitorPhoto selectedPlace={placeData.pictures} />
                  </div>
                </>
              )}
              {/* {activeTab === '메뉴' && <Menu selectedPlace={placeData} />} */}
              {activeTab === '사진' && (
                <VisitorPhoto selectedPlace={placeData.pictures} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PlaceDetailCampus
