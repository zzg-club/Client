'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import PinMap from '@/components/Map/PinMap'
import RouteMap from '@/components/Map/RouteMap'
import Title from '@/components/Header/Middle/TitleMiddle'
import BottomSheet from './BottomSheet'
import dummyDataArray from '@/data/dummyDataArray.json'
import { loadKakaoMaps } from '@/utils/kakaoLoader'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import BackButton from '@/components/Buttons/Middle/BackButton'

export default function Middle() {
  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0) // 현재 인덱스
  const [participants, setParticipants] = useState([])
  const [destination, setDestination] = useState(dummyDataArray[0].destination)

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
            dummyDataArray[currentIndex].destination.lat,
            dummyDataArray[currentIndex].destination.lng,
          ),
          level: 4,
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
          name: '내 위치',
          time: '50분',
          icon: '/sampleProfile.png',
          lat: location.lat,
          lng: location.lng,
          transport: 'subway',
          transportIcon: '/subwayPurple.svg',
          depart: '죽전역',
        }

        const updatedParticipants = [
          myInfo,
          ...dummyDataArray[currentIndex].participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayYellow.svg',
          })),
        ]

        setParticipants(updatedParticipants)
      } catch (error) {
        console.error('현재 위치를 가져오지 못했습니다:', error)

        const fallbackInfo = {
          name: '기본 위치',
          time: '기본 시간',
          icon: '/sampleProfile.png',
          lat: 37.5665,
          lng: 126.978,
          transport: 'subway',
          transportIcon: '/subwayPurple.svg',
          depart: '서울역',
        }

        const updatedParticipants = [
          fallbackInfo,
          ...dummyDataArray[currentIndex].participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayYellow.svg',
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

  const handleConfirm = () => {
    console.log(`현재 도착지 확정: ${destination.name}`)
    // 추가 작업 (예: 서버로 확정 상태 전송)
  }

  return (
    <div className="flex flex-col h-screen relative">
      <div
        className="absolute inset-0 z-0"
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
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

      <header
        className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md"
        style={{
          borderRadius: '0px 0px 24px 24px',
        }}
      >
        <Title
          buttonText="확정"
          buttonLink="#"
          initialTitle="제목 없는 일정"
          onTitleChange={(newTitle) => console.log('새 제목:', newTitle)}
          isPurple={true}
          isDisabled={participants.length <= 1} // 참여 인원이 1명 이하일 경우 비활성화
          onConfirm={handleConfirm} // 확정 동작
        />
      </header>

      <BackButton
        onClick={() => router.push('/search?from=/letsmeet')}
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
