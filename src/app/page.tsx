'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [isSheetExpanded, setIsSheetExpanded] = useState(false) // Bottom Sheet 상태
  const startYRef = useRef<number | null>(null) // 드래그 시작 위치 저장

  // 드래그 시작
  const handleTouchStart = (event: React.TouchEvent) => {
    console.log('Touch Start:', event.touches[0].clientY)
    startYRef.current = event.touches[0].clientY
  }

  // 드래그 동작
  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault() // 기본 이벤트 방지
    event.stopPropagation() // 이벤트 전파 방지

    if (startYRef.current === null) return
    const currentY = event.touches[0].clientY
    const deltaY = startYRef.current - currentY

    console.log('Touch Move:', { deltaY })

    // 위로 드래그했을 때
    if (deltaY > 50) {
      console.log('Swiped Up')
      setTimeout(() => setIsSheetExpanded(true), 0) // 상태 업데이트 지연
      startYRef.current = null
    }

    // 아래로 드래그했을 때
    if (deltaY < -50) {
      console.log('Swiped Down')
      setTimeout(() => setIsSheetExpanded(false), 0) // 상태 업데이트 지연
      startYRef.current = null
    }
  }

  // 드래그 종료
  const handleTouchEnd = () => {
    console.log('Touch End')
    startYRef.current = null // 초기화
  }

  return (
    <div
      className="flex h-screen overflow-hidden items-center justify-center relative"
      style={{
        background: 'linear-gradient(180deg, #9562FB 0%, #F9F0FF 100%)', // 배경 그라데이션
      }}
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-4"></div>
        <div
          className="p-6"
          style={{
            padding: '40px 48px',
          }}
        >
          <div
            style={{
              marginBottom: '48px',
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
                lineHeight: '28px', // 조정된 라인 높이
                letterSpacing: '-0.5px',
                marginBottom: '16px', // 간격 조정
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis', // 넘침 처리
              }}
            >
              환영해요!
            </h2>
            <p
              style={{
                color: 'var(--glassmorph-black, #1E1E1E)',
                textAlign: 'left',
                fontFamily: 'Pretendard',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 300,
                lineHeight: '22px',
                letterSpacing: '-0.5px',

                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              대학 새내기를 위한 캠퍼스 라이프 필수템
            </p>
          </div>
          <div
            style={{
              marginBottom: '48px',
            }}
          >
            {/* 간편 로그인과 실선 */}
            <div className="flex items-center justify-center mb-8">
              <div
                style={{
                  width: '93px',
                  height: '0.5px',
                  backgroundColor: 'var(--NavBarColor, #AFAFAF)',
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
                  margin: '0 12px',
                }}
              >
                간편 로그인
              </p>
              <div
                style={{
                  width: '93px',
                  height: '0.5px',
                  backgroundColor: 'var(--NavBarColor, #AFAFAF)',
                }}
              ></div>
            </div>
          </div>
          <div
            className="kakao_button"
            style={{
              display: 'flex',
              width: '300px',
              height: '45px',
              padding: '10px 64px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
              borderRadius: '12px',
              background: '#FEE500',
              cursor: 'pointer',
              marginBottom: '125px',
            }}
            onClick={() => console.log('Kakao Login Clicked')}
          >
            <img
              src="/kakao.svg"
              alt="Kakao Icon"
              style={{
                width: '20px',
                height: '20px',
              }}
            />
            <span
              style={{
                color: '#000',
                fontSize: '16px',
                fontFamily: 'AppleSDGothicNeoM00',
                fontWeight: 400,
              }}
            >
              카카오 로그인
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
