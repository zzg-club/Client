'use client'

import React, { useState, useEffect, useRef } from 'react'
import KakaoMap from '@/components/Map/KakaoMap'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import Title from '@/components/Header/Title'

interface Location {
  lat: number
  lng: number
  name: string
}

export default function Middle() {
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null)
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

  useEffect(() => {
    getCurrentLocation()
      .then((location) => {
        setSelectedPlace({
          lat: location.lat,
          lng: location.lng,
          name: '현재 위치',
        })
      })
      .catch((error) => console.error('Error getting location:', error))
  }, [])

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <header className="w-full bg-white shadow-md fixed top-0 left-0 z-10 rounded-full">
        <div>
          <Title />
        </div>
      </header>

      {/* Kakao Map Section */}
      <div className="flex-grow items-center justify-center">
        {selectedPlace ? (
          <KakaoMap selectedPlace={selectedPlace} />
        ) : (
          <p className="text-center text-gray-500">Loading map...</p>
        )}
      </div>

      {/* Bottom Sheet */}
      <div
        className={`relative bottom-0 left-0 w-full bg-white rounded-full transition-transform duration-300 ${
          isSheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-42px)]'
        }`}
        style={{
          boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-4"></div>
        <div>
          <p className="text-center text-gray-500">Bottom Sheet Content</p>
        </div>
      </div>
    </div>
  )
}
