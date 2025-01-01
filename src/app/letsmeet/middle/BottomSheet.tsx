import React, { useState, useRef } from 'react'

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
  const [isExpanded, setIsExpanded] = useState(false) // 확장 상태 관리
  const startYRef = useRef<number | null>(null)
  const [translateY, setTranslateY] = useState(0)

  const minHeight = 229 // 기본 높이
  const maxHeight = 400 // 확장 높이

  // 터치 시작
  const handleTouchStart = (event: React.TouchEvent) => {
    startYRef.current = event.touches[0].clientY
  }

  // 터치 이동
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

  // 터치 종료
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
      className={`absolute bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg transition-transform duration-300`}
      style={{
        height: isExpanded ? `${maxHeight}px` : `${minHeight}px`, // 확장 여부에 따른 높이 조정
        transform: `translateY(${translateY}px)`,
        padding: '10px 40px 40px 40px', // 위 30px, 아래 및 좌우 40px 패딩
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

      {/* 부모 컨테이너 */}
      <div className="flex flex-col items-center gap-7">
        {/* 장소 정보 */}
        <div className="flex justify-between items-center w-full">
          <p
            className="font-pretendard text-black text-2xl font-medium leading-[17px] tracking-tight"
            style={{
              color: '#000',
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: '17px',
              letterSpacing: '-0.5px',
            }}
          >
            {placeName}
          </p>
          <p className="text-sm font-pretendard">
            참여 인원:{' '}
            <span
              style={{
                color: 'var(--MainColor, #9562FB)',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '17px',
                letterSpacing: '-0.5px',
              }}
            >
              {totalParticipants}명
            </span>
          </p>
        </div>
        {/* 사용자 정보 */}
        <div className="grid grid-cols-2 gap-x-7 gap-y-7 justify-center">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2"
              style={{
                width: '130px',
                height: '47px',
              }}
            >
              {/* Globe 아이콘 */}
              <img
                src={participant.icon}
                alt={`${participant.name} 아이콘`}
                className="rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                }}
              />
              {/* 이동 시간 */}
              <p
                className="font-pretendard text-center font-semibold"
                style={{
                  color: 'var(--MainColor, #9562FB)',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '17px',
                  letterSpacing: '-0.5px',
                }}
              >
                {participant.time}
              </p>
              {/* 대중교통 아이콘 */}
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
