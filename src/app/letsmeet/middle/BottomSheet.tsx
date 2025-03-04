'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import MiddleFooter2Right from '@/components/Buttons/Middle/Bottom/MiddleFooter2Right'
import MiddleFooter2Left from '@/components/Buttons/Middle/Bottom/MiddleFooter2Left'
import styles from './BottomSheet.module.css'
import Image from 'next/image'

interface Participant {
  userId: number
  userName: string
  userProfile: string
  latitude: number
  longitude: number
}

interface Time {
  userId: number
  time: number
  locations?: { userId: number; time: number }[]
}

interface BottomSheetProps {
  placeName: string
  participants: Participant[]
  totalParticipants: number
  time: Time[]
  onConfirm: () => void
  onSlideChange: (direction: 'left' | 'right') => void
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  placeName,
  participants,
  totalParticipants,
  time,
  onSlideChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [maxHeight, setMaxHeight] = useState(400)
  const [highestMaxHeight, setHighestMaxHeight] = useState(400) // 최고 높이
  const [arrowHeight, setArrowHeight] = useState(110)
  const minHeight = 229
  const paddingBottom = 42

  const sheetRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)

  const updateHeight = useCallback(() => {
    if (sheetRef.current) {
      const contentHeight = sheetRef.current.scrollHeight
      const calculatedMaxHeight = contentHeight

      // 현재 높이와 비교하여 최대 높이 추적
      if (calculatedMaxHeight > highestMaxHeight) {
        setHighestMaxHeight(calculatedMaxHeight) // 최고 높이 갱신
      }

      // 현재 높이를 최고 높이로 고정
      setMaxHeight(highestMaxHeight)

      // arrowHeight 업데이트
      if (isExpanded) {
        setArrowHeight(highestMaxHeight / 2.3) // 최대 높이의 절반
      } else {
        setArrowHeight(110) // 기본 높이
      }
    }
  }, [isExpanded, highestMaxHeight])

  useEffect(() => {
    window.addEventListener('resize', updateHeight)
    updateHeight()

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [isExpanded, participants.length, updateHeight])

  const handleTouchStart = (event: React.TouchEvent) => {
    startXRef.current = event.touches[0].clientX
    startYRef.current = event.touches[0].clientY
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (startYRef.current === null) return
    const currentY = event.touches[0].clientY
    const deltaY = currentY - startYRef.current

    if (isExpanded) {
      setTranslateY(Math.min(deltaY, maxHeight - minHeight))
    } else {
      setTranslateY(Math.max(deltaY, minHeight - maxHeight))
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const endX = event.changedTouches[0].clientX

    // 캐러셀 슬라이드 감지
    const deltaX = (startXRef.current ?? 0) - endX
    const deltaY = translateY

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      // 가로 슬라이드
      if (deltaX > 0) {
        onSlideChange('right') // 오른쪽 슬라이드
      } else {
        onSlideChange('left') // 왼쪽 슬라이드
      }
    } else if (Math.abs(deltaY) > 50) {
      // 위로 당겨질 경우
      if (deltaY < -50 && totalParticipants > 4) {
        setIsExpanded(true)
        setTranslateY(0)
      } else if (deltaY > 50) {
        // 아래로 당겨질 경우
        setIsExpanded(false)
        setTranslateY(0)
      } else {
        // 변화 없을 경우 원위치로
        setTranslateY(0)
      }
    }

    setTranslateY(0)
    startXRef.current = null
    startYRef.current = null
  }

  const handleSlideChange = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onSlideChange('left')
    } else {
      onSlideChange('right')
    }
    setMaxHeight(highestMaxHeight) // 슬라이드 변경 시 최고 높이를 유지
  }

  const getUserTime = (userId: number) => {
    for (const location of time) {
      if (location.locations) {
        const userTime = location.locations.find((l) => l.userId === userId)
        if (userTime) return userTime.time
      }
    }
    return null
  }

  return (
    <div
      ref={sheetRef}
      className={styles.bottomSheet}
      style={{
        height: isExpanded ? `${maxHeight}px` : `${minHeight}px`,
        transform: `translateY(${translateY}px)`,
        padding: `10px 0px ${paddingBottom}px 0px`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.handleBar}></div>

      <div className={styles.contentWrapper}>
        <div className={styles.placeInfo}>
          <div className="flex justify-between items-center text-center w-full">
            <p className={styles.placeTitle}>{placeName}</p>
            <div className={styles.participantCount}>
              <p className={styles.participantCountText}>
                참여 인원 :{' '}
                <span className={styles.participantCountHighlight}>
                  {totalParticipants}명
                </span>
              </p>
              <Image
                src="/arrow_back_mirrored.svg"
                alt="Arrow Icon"
                width={6}
                height={10}
              />
            </div>
          </div>
        </div>

        <div
          className={`${styles.arrow} ${styles.arrowLeft}`}
          style={{ top: `${arrowHeight}px` }}
          onClick={() => handleSlideChange('left')}
        >
          <MiddleFooter2Left />
        </div>

        <div ref={listRef} className={styles.participantList}>
          <div className={styles.participantGrid}>
            {participants.map((participant, index) => {
              const userTime = getUserTime(participant.userId)
              return (
                <div key={index} className={styles.participantItem}>
                  <Image
                    src={participant.userProfile}
                    alt={`프로필 아이콘`}
                    width={36}
                    height={36}
                    className={`${styles.participantIcon} `}
                    style={{
                      borderColor:
                        index === 0
                          ? 'var(--MainColor, #9562FB)'
                          : 'var(--subway_time, #AFAFAF)',
                    }}
                  />

                  <p
                    className={styles.participantText}
                    style={{
                      color:
                        index === 0
                          ? 'var(--MainColor, #9562FB)'
                          : 'var(--subway_time, #AFAFAF)',
                    }}
                  >
                    {userTime !== undefined ? `${userTime}분` : ''}
                  </p>
                  <Image
                    src={'/train.svg'}
                    alt="Transport Icon"
                    width={28}
                    height={28}
                    className={`${styles.transportIcon} ${index === 0 ? styles.mainTransportIcon : ''}`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div
          className={`${styles.arrow} ${styles.arrowRight}`}
          style={{ top: `${arrowHeight}px` }}
          onClick={() => handleSlideChange('right')}
        >
          <MiddleFooter2Right />
        </div>
      </div>
    </div>
  )
}

export default BottomSheet
