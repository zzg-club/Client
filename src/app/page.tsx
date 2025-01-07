'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [isSheetExpanded, setIsSheetExpanded] = useState(false) // Bottom Sheet 상태
  const startYRef = useRef<number | null>(null) // 드래그 시작 위치 저장
  const isDraggingRef = useRef<boolean>(false) // 드래그 여부 확인

  // 드래그 시작
  const handleStart = (y: number) => {
    startYRef.current = y
    isDraggingRef.current = true
  }

  // 드래그 중
  const handleMove = (y: number) => {
    if (!isDraggingRef.current || startYRef.current === null) return

    const deltaY = startYRef.current - y
    console.log('Drag Move:', deltaY)

    if (deltaY > 50) {
      console.log('Swiped Up')
      setIsSheetExpanded(true)
      isDraggingRef.current = false // 드래그 상태 초기화
    }

    if (deltaY < -50) {
      console.log('Swiped Down')
      setIsSheetExpanded(false)
      isDraggingRef.current = false // 드래그 상태 초기화
    }
  }

  // 드래그 종료
  const handleEnd = () => {
    console.log('Drag End')
    isDraggingRef.current = false
    startYRef.current = null // 초기화
  }

  return (
    <div
      className="flex h-screen overflow-hidden items-center justify-center relative"
      style={{
        background: 'linear-gradient(180deg, #9562FB 0%, #F9F0FF 100%)', // 배경 그라데이션
      }}
      onMouseMove={(e) => isDraggingRef.current && handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd} // 마우스가 화면 밖으로 나갔을 때 초기화
    >
      {/* Splash 화면 */}
      <div
        className="flex flex-col items-center"
        style={{
          paddingTop: '308px',
          paddingBottom: '308px',
          paddingLeft: '146px',
          paddingRight: '146px',
        }}
      >
        <img
          src="/logo.svg"
          alt="MOIM Logo"
          style={{ width: '100px', height: '100px' }}
        />
        <h1
          className="text-white font-bold mt-4"
          style={{
            color: 'var(--Grays-White, #FFF)',
            textAlign: 'center',
            fontFamily: 'Pretendard',
            fontSize: '32px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '17px', // 53.125%
            letterSpacing: '-0.5px',
          }}
        >
          MOIM
        </h1>
      </div>

      {/* Bottom Sheet */}
      <div
        className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl transition-transform duration-300"
        style={{
          transform: isSheetExpanded
            ? 'translateY(0)'
            : 'translateY(calc(100% - 42px))',
          boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientY)}
      >
        <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-4"></div>
        <div
          className="p-6"
          style={{
            padding: '40px 56px', // 위아래 40px, 좌우 56px
          }}
        >
          <h2
            style={{
              color: 'var(--glassmorph-black, #1E1E1E)',
              textAlign: 'left', // 왼쪽 정렬
              fontFamily: 'Pretendard',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '17px', // 70.833%
              letterSpacing: '-0.5px',
              marginBottom: '24px',
            }}
          >
            환영해요!
          </h2>
          <p
            style={{
              color: 'var(--glassmorph-black, #1E1E1E)',
              textAlign: 'left', // 왼쪽 정렬
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 300,
              lineHeight: '17px', // 106.25%
              letterSpacing: '-0.5px',
              marginBottom: '48px',
            }}
          >
            대학 새내기를 위한 캠퍼스 라이프 필수템
          </p>
          <div className="flex items-center justify-center mb-48">
            <div
              style={{
                width: '93px',
                height: '0.5px',
                backgroundColor: 'var(--NavBarColor, #AFAFAF)',
                marginBottom: '48px',
              }}
            ></div>
            <p
              style={{
                color: 'var(--NavBarColor, #AFAFAF)',
                fontFamily: 'Pretendard',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                margin: '0 16px',
                marginBottom: '48px',
              }}
            >
              간편 로그인
            </p>
            <div
              style={{
                width: '93px',
                height: '0.5px',
                backgroundColor: 'var(--NavBarColor, #AFAFAF)',
                marginBottom: '48px',
              }}
            ></div>
          </div>
          <img
            src="/kakao_login_2.png"
            alt="카카오톡 로그인"
            className="w-full"
            style={{
              cursor: 'pointer',
            }}
          />
        </div>
      </div>
    </div>
  )
}
