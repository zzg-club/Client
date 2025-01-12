'use client'

import { useEffect, useState, useRef } from 'react'
import MiddleFooter2Right from '@/components/Buttons/Middle/Bottom/MiddleFooter2Right'
import MiddleFooter2Left from '@/components/Buttons/Middle/Bottom/MiddleFooter2Left'
import styles from './BottomSheet.module.css'

interface Participant {
  name: string
  time: string
  icon: string
  transportIcon: string
}

interface BottomSheetProps {
  placeName: string
  participants: Participant[]
  totalParticipants: number
  onSlideChange: (direction: 'left' | 'right') => void
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  placeName,
  participants,
  totalParticipants,
  onSlideChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [maxHeight, setMaxHeight] = useState(400)
  const [arrowHeight, setArrowHeight] = useState(110)
  const [activeIndex, setActiveIndex] = useState(0)
  const minHeight = 229
  const paddingBottom = 42

  const sheetRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)

  useEffect(() => {
    const updateHeight = () => {
      if (sheetRef.current) {
        const contentHeight = sheetRef.current.scrollHeight
        setMaxHeight(contentHeight + paddingBottom)
      }

      if (listRef.current && !isExpanded) {
        setArrowHeight(110)
      }

      if (listRef.current && isExpanded) {
        const listHeight = listRef.current.offsetHeight
        setArrowHeight(listHeight / 1.3)
      }
    }

    window.addEventListener('resize', updateHeight)
    updateHeight()

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [participants, isExpanded])

  const handleTouchStart = (event: React.TouchEvent) => {
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

  const handleTouchEnd = () => {
    if (translateY < -50) {
      setIsExpanded(true)
      setTranslateY(0)
    } else if (translateY > 50) {
      setIsExpanded(false)
      setTranslateY(0)
    } else {
      setTranslateY(0)
    }

    startYRef.current = null
  }

  const handleLeftClick = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0)) // 왼쪽 슬라이드
  }

  const handleRightClick = () => {
    setActiveIndex((prev) => (prev < 1 ? prev + 1 : 1)) // 오른쪽 슬라이드
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
              <img
                src="/arrow_back_mirrored.svg"
                alt="Arrow Icon"
                style={{
                  width: '12px',
                  height: '12px',
                }}
              />
            </div>
          </div>
        </div>

        <div
          className={`${styles.arrow} ${styles.arrowLeft}`}
          style={{ top: `${arrowHeight}px` }}
          onClick={() => onSlideChange('left')}
        >
          <MiddleFooter2Left onClick={handleLeftClick} />
        </div>

        <div ref={listRef} className={styles.participantList}>
          <div className={styles.participantGrid}>
            {participants.map((participant, index) => (
              <div key={index} className={styles.participantItem}>
                <img
                  src={participant.icon}
                  alt={`${participant.name} 아이콘`}
                  className={styles.participantIcon}
                  style={{
                    borderColor:
                      index === 0
                        ? 'var(--MainColor, #9562FB)'
                        : 'var(--subway_time, #FFCF33)',
                  }}
                />
                <p
                  className={styles.participantText}
                  style={{
                    color:
                      index === 0
                        ? 'var(--MainColor, #9562FB)'
                        : 'var(--subway_time, #FFCF33)',
                  }}
                >
                  {participant.time}
                </p>
                <img
                  src={participant.transportIcon}
                  alt="Transport Icon"
                  className={styles.transportIcon}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${styles.arrow} ${styles.arrowRight}`}
          style={{ top: `${arrowHeight}px` }}
          onClick={() => onSlideChange('right')}
        >
          <MiddleFooter2Right onClick={handleRightClick} />
        </div>
      </div>
    </div>
  )
}

export default BottomSheet
