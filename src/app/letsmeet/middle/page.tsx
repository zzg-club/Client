'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PinMap from '@/components/Map/PinMap'
import RouteMap from '@/components/Map/RouteMap'
import Title from '@/components/Header/Middle/TitleMiddle'
import BottomSheet from './BottomSheet'
import dummyDataArray from '@/data/dummyDataArray.json'
import { loadKakaoMaps } from '@/utils/kakaoLoader'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import BackButton from '@/components/Buttons/Middle/BackButton'

interface Participant {
  id: number
  name: string
  time: string
  image: string
  lat: number
  lng: number
  transport: string
  transportIcon: string
  depart: string
}

export default function Middle() {
  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0) // 현재 인덱스
  const [participants, setParticipants] = useState<Participant[]>([])
  const [destination, setDestination] = useState(dummyDataArray[0].destination)
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadKakaoMaps()
        const mapContainer = mapContainerRef.current
        if (!mapContainer) return

        const kakaoMapInstance = new window.kakao.maps.Map(mapContainer, {
          center: new window.kakao.maps.LatLng(
            destination.lat,
            destination.lng,
          ),
          level: 3,
        })

        setKakaoMap(kakaoMapInstance)
        setDestination(dummyDataArray[currentIndex].destination)
      } catch (error) {
        console.error('Error initializing Kakao Maps:', error)
      }
    }

    const updateParticipants = async () => {
      try {
        const location = await getCurrentLocation()
        const myInfo = {
          id: 0,
          name: '내 위치',
          time: '50분',
          image: '/sampleProfile.png',
          lat: location.lat,
          lng: location.lng,
          transport: 'subway',
          transportIcon: '/train.svg',
          depart: '죽전역',
        }

        const updatedParticipants = [
          myInfo,
          ...dummyDataArray[currentIndex].participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayGray.svg',
          })),
        ]

        setParticipants(updatedParticipants)
      } catch (error) {
        console.error('현재 위치를 가져오지 못했습니다:', error)
        const fallbackInfo = {
          id: 0,
          name: '기본 위치',
          time: '기본 시간',
          image: '/sampleProfile.png',
          lat: 37.5665,
          lng: 126.978,
          transport: 'subway',
          transportIcon: '/train.svg',
          depart: '서울역',
        }

        const updatedParticipants = [
          fallbackInfo,
          ...dummyDataArray[currentIndex].participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayGray.svg',
          })),
        ]

        setParticipants(updatedParticipants)
      }
    }

    initializeMap()
    updateParticipants()
  }, [currentIndex])

  const handleSlideChange = (direction: 'left' | 'right') => {
    setCurrentIndex((prevIndex) => {
      if (direction === 'left') {
        return prevIndex > 0 ? prevIndex - 1 : dummyDataArray.length - 1
      } else {
        return prevIndex < dummyDataArray.length - 1 ? prevIndex + 1 : 0
      }
    })
  }

  return (
    <div className="flex flex-col h-screen relative">
      <div
        className="absolute inset-0 z-0 w-full h-full"
        ref={mapContainerRef}
      ></div>

      {kakaoMap && destination && participants.length > 0 && (
        <>
          <PinMap
            kakaoMap={kakaoMap}
            participants={participants}
            destination={destination}
          />
          <RouteMap
            kakaoMap={kakaoMap}
            participants={participants}
            destination={destination}
          />
        </>
      )}

      <header className="absolute top-0 left-0 right-0 shadow-md rounded-b-[24px]">
        <Title
          buttonText="확정"
          buttonLink="#"
          initialTitle="제목 없는 일정"
          onTitleChange={(newTitle) => console.log('새 제목:', newTitle)}
          isPurple
          isDisabled={participants.length <= 1}
        />
      </header>

      <BackButton
        onClick={() => router.push(`/search?from=${from}`)}
        style={{
          position: 'relative',
          top: '72px',
          left: '10px',
          zIndex: 2,
        }}
      />

      <BottomSheet
        placeName={destination.name}
        participants={participants}
        totalParticipants={participants.length}
        onSlideChange={handleSlideChange}
      />
    </div>
  )
}
