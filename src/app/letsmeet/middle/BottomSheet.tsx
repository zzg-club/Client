'use client'

import { useEffect, useState, useRef } from 'react'
import MiddleFooter2Right from '@/components/Buttons/MiddleFooter2Right'
import MiddleFooter2Left from '@/components/Buttons/MiddleFooter2Left'

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
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  placeName,
  participants,
  totalParticipants,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [maxHeight, setMaxHeight] = useState(400)
  const [arrowHeight, setArrowHeight] = useState(81) // 화살표 초기 높이
  const minHeight = 229
  const paddingBottom = 42

  const sheetRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null) // 모임원 리스트 컨테이너 참조
  const startYRef = useRef<number | null>(null)

  useEffect(() => {
    const updateHeight = () => {
      if (sheetRef.current) {
        const contentHeight = sheetRef.current.scrollHeight
        setMaxHeight(contentHeight + paddingBottom)
      }

      // 초기 화살표 위치 설정
      if (listRef.current && !isExpanded) {
        setArrowHeight(110)
      }

      // 리스트 중간으로 이동
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

  return (
    <div
      ref={sheetRef}
      className="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg transition-transform duration-300"
      style={{
        height: isExpanded ? `${maxHeight}px` : `${minHeight}px`,
        transform: `translateY(${translateY}px)`,
        padding: `10px 0px ${paddingBottom}px 0px`,
        boxSizing: 'border-box',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-7"></div>

      <div className="relative w-full overflow-visible">
        {/* 장소 및 참여 인원 컨테이너 */}
        <div
          style={{
            marginLeft: '38px',
            marginRight: '38px',
          }}
        >
          <div className="flex justify-between items-center text-center w-full mb-8">
            <p className="text-black text-2xl font-semibold">{placeName}</p>
            <div className="w-23 h-4 flex items-center gap-1">
              <p
                className="text-sm"
                style={{
                  color: '#000',
                  fontFamily: 'Pretendard',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '17px',
                  letterSpacing: '-0.5px',
                }}
              >
                참여 인원 :{' '}
                <span
                  className="text-purple-500 font-semibold"
                  style={{
                    color: 'var(--MainColor, #9562FB)',
                    fontFamily: 'Pretendard',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '17px',
                    letterSpacing: '-0.5px',
                  }}
                >
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

        {/* 좌 화살표 */}
        <div
          className="absolute left-1 transform -translate-y-1/2"
          style={{
            zIndex: 10,
            top: `${arrowHeight}px`, // 동적 높이 적용
          }}
        >
          <MiddleFooter2Left
            onClick={() => console.log('왼쪽 보라색 버튼 클릭')}
          />
        </div>

        {/* 모임원 리스트 */}
        <div ref={listRef} className="flex justify-center items-center">
          <div className="grid grid-cols-2 gap-x-9 gap-y-7 justify-center">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2"
                style={{
                  width: '121px',
                  height: '36px', // 각 행의 높이
                }}
              >
                <img
                  src={participant.icon}
                  alt={`${participant.name} 아이콘`}
                  className="rounded-full w-9 h-9 border-2"
                  style={{
                    borderColor:
                      index === 0
                        ? 'var(--MainColor, #9562FB)'
                        : 'var(--subway_time, #FFCF33)',
                    opacity: 0.64,
                    background: `url(${participant.icon}) lightgray 50% / cover no-repeat`,
                  }}
                />
                <p
                  className="text-lg font-medium"
                  style={{
                    color:
                      index === 0
                        ? 'var(--MainColor, #9562FB)'
                        : 'var(--subway_time, #FFCF33)',
                    textAlign: 'center',
                    fontFamily: 'Pretendard',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '17px',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {participant.time}
                </p>
                <img
                  src={participant.transportIcon}
                  alt={`${participant.transport} 아이콘`}
                  className="w-7 h-7"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 우 화살표 */}
        <div
          className="absolute right-1 transform -translate-y-1/2"
          style={{
            zIndex: 10,
            top: `${arrowHeight}px`, // 동적 높이 적용
          }}
        >
          <MiddleFooter2Right
            onClick={() => console.log('오른쪽 보라색 버튼 클릭')}
          />
        </div>
      </div>
    </div>
  )
}

export default BottomSheet
