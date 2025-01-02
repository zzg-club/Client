'use client'

import React, { useState, useEffect } from 'react'
import KakaoMap from '@/components/Map/KakaoMap'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import Title from '@/components/Header/Title'
import BottomSheet from './BottomSheet'

interface Location {
  lat: number
  lng: number
  name: string
}

export default function Middle() {
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null)

  // 현재 위치 가져오기
  useEffect(() => {
    getCurrentLocation()
      .then((location) => {
        setSelectedPlace({
          lat: location.lat,
          lng: location.lng,
          name: '현재 위치',
        })
      })
      .catch((error) => {
        console.error('Error getting location:', error)
      })
  }, [])

  // 참여자 더미 데이터 (8명)
  const participants = [
    {
      name: 'Alice',
      time: '24분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Bob',
      time: '18분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Charlie',
      time: '15분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Dave',
      time: '18분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Eve',
      time: '20분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Frank',
      time: '22분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Grace',
      time: '25분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
    {
      name: 'Hank',
      time: '30분',
      icon: '/globe.svg',
      transportIcon: '/subway.svg',
    },
  ]

  return (
    <div className="flex flex-col h-screen relative">
      {/* 카카오 지도 */}
      <div className="absolute inset-0 z-0">
        {selectedPlace ? (
          <KakaoMap
            selectedPlace={selectedPlace}
            onMoveToCurrentLocation={() =>
              console.log('Move to current location')
            }
          />
        ) : (
          <p className="text-center text-gray-500">
            현재 위치를 가져오는 중입니다...
          </p>
        )}
      </div>

      {/* 헤더 */}
      <header
        className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md"
        style={{
          borderRadius: '0px 0px 24px 24px',
        }}
      >
        <Title
          buttonText="확정"
          buttonLink="/next-page"
          initialTitle="제목 없는 일정"
          onTitleChange={(newTitle) => console.log(newTitle)}
          isPurple={true}
        />
      </header>

      {/* Bottom Sheet */}
      <BottomSheet
        placeName="성복역"
        participants={participants}
        totalParticipants={participants.length}
      />
    </div>
  )
}
