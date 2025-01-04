'use client'

import React, { useState, useEffect } from 'react'
import PinMap from '@/components/Map/PinMap'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import Title from '@/components/Header/TitleMiddle'
import BottomSheet from './BottomSheet'
import dummyData from '@/data/dummyData.json'

interface Participant {
  name: string
  time: string
  icon: string
  lat: number
  lng: number
  transportIcon: string
}

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

  const participants: Participant[] = dummyData.participants

  return (
    <div className="flex flex-col h-screen relative">
      <div className="absolute inset-0 z-0">
        {selectedPlace ? (
          <PinMap
            selectedPlace={selectedPlace}
            participants={participants}
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

      <BottomSheet
        placeName="성복역"
        participants={participants}
        totalParticipants={participants.length}
      />
    </div>
  )
}
