'use client'

import { useEffect, useState, useRef } from 'react'

interface Participant {
  name: string
  time: string
  icon: string // Globe 아이콘
  transportIcon: string // 대중교통 아이콘
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
  const minHeight = 229
  const paddingBottom = 21

  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)

  useEffect(() => {
    if (sheetRef.current) {
      const contentHeight = sheetRef.current.scrollHeight
      setMaxHeight(contentHeight + paddingBottom)
    }
  }, [participants])

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
        padding: `10px 40px ${paddingBottom}px 40px`,
        boxSizing: 'border-box',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
      <div className="flex flex-col items-center gap-7">
        <div className="flex justify-between items-center w-full">
          <p className="text-black text-2xl font-semibold">{placeName}</p>
          <p className="text-sm">
            참여 인원:{' '}
            <span className="text-purple-500">{totalParticipants}명</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-7 gap-y-7 justify-center">
          {participants.map((participant, index) => (
            <div
              key={index}
              className={`flex items-center justify-center gap-2 ${
                index === 0 ? 'bg-purple-100' : ''
              }`} // 내 정보 강조를 위해 스타일 추가
              style={{
                width: '130px',
                height: '47px',
              }}
            >
              <img
                src={participant.icon}
                alt={`${participant.name} 아이콘`}
                className="rounded-full w-8 h-8"
              />
              <p
                className={`text-lg font-medium ${
                  index === 0 ? 'text-purple-700' : 'text-purple-500'
                }`}
              >
                {participant.time}
              </p>
              <img
                src={participant.transportIcon}
                alt="대중교통 아이콘"
                className="w-7 h-7"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomSheet
