'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import KakaoMap from '@/components/Map/KakaoMap'
import styles from '@/app/place/styles/Detail.module.css'


export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [bottomSheetState, setBottomSheetState] = useState<
    'collapsed' | 'middle' | 'expanded'
  >('collapsed')
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

  return (
    <div className={styles['mobile-container']}>

      <div className={styles['map-container']}>
        <KakaoMap selectedPlace={selectedPlace} />
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
            <div className={styles.cardContent}>
              {/* 카드 헤더 */}
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>풍경 한우</h3>
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
                "풍경한우? 가족 생일마다 가는 단골 맛집! 길이 험하고 반찬 줄어든 건 아쉽지만, 고기가 정말 최고야!"
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
