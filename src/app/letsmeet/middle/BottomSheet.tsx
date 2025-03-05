'use client'

import { useEffect, useRef } from 'react'
import MiddleFooter2Right from '@/components/Buttons/Middle/Bottom/MiddleFooter2Right'
import MiddleFooter2Left from '@/components/Buttons/Middle/Bottom/MiddleFooter2Left'
import { useBottomSheet } from '@/hooks/useMiddleBottomsheet'
import styles from './BottomSheet.module.css'
import Image from 'next/image'

interface Participant {
  userId: number
  userName: string
  userProfile: string
  latitude: number
  longitude: number
  type: string
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
  const sheetRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    bottomSheetState,
    setBottomSheetState,
    handleStart,
    handleMove,
    handleEnd,
  } = useBottomSheet()

  useEffect(() => {
    if (participants.length < 4) {
      setBottomSheetState('collapsed')
    }
  }, [participants.length, setBottomSheetState])

  // 바텀시트 높이 설정 (4명 이상일 때만 middle 이상 가능)
  const getHeight = () => {
    switch (bottomSheetState) {
      case 'collapsed':
        return '229px'
      case 'middle':
        return participants.length >= 4 ? '400px' : '229px' // 4명 이상만 middle 가능
      case 'expanded':
        return participants.length >= 4 ? '80vh' : '400px' // 4명 이상만 expanded 가능
      default:
        return '229px'
    }
  }

  const handleSlideChange = (direction: 'left' | 'right') => {
    onSlideChange(direction)
  }

  const getUserTime = (userId: number) => {
    for (const location of time) {
      if (location.locations) {
        const userTime = location.locations.find((l) => l.userId === userId)
        if (userTime) return userTime.time
      }
    }
    return 0
  }

  const getUserImage = (type: string) => {
    return type === '&my' ? '/subwayPurple.svg' : '/subwayGray.svg'
  }

  return (
    <div
      ref={sheetRef}
      className={styles.bottomSheet}
      style={{
        height: getHeight(),
        transition: 'height 0.3s ease-in-out',
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY, participants.length)}
      onTouchEnd={handleEnd}
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
          style={{ top: 110 }}
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
                  <img
                    src={participant.userProfile}
                    alt="프로필 아이콘"
                    width={36}
                    height={36}
                    className={styles.participantIcon}
                    style={{
                      borderColor:
                        participant.type === '&my'
                          ? 'var(--MainColor, #9562FB)'
                          : 'var(--subway_time, #AFAFAF)',
                      borderRadius: '50%', // 원형 프로필 유지 (필요 시 추가)
                      objectFit: 'cover', // 이미지 비율 유지 (필요 시 추가)
                    }}
                  />

                  <p
                    className={styles.participantText}
                    style={{
                      color:
                        participant.type === '&my'
                          ? 'var(--MainColor, #9562FB)'
                          : 'var(--subway_time, #AFAFAF)',
                    }}
                  >
                    {userTime}분
                  </p>
                  <Image
                    src={getUserImage(participant.type)}
                    alt="Transport Icon"
                    width={28}
                    height={28}
                    className="w-[28px] h-[28px] object-contain aspect-square"
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div
          className={`${styles.arrow} ${styles.arrowRight}`}
          style={{ top: 110 }}
          onClick={() => handleSlideChange('right')}
        >
          <MiddleFooter2Right />
        </div>
      </div>
    </div>
  )
}

export default BottomSheet
