'use client'

import { useRouter } from 'next/navigation' // Next.js Router 사용
import React, { useEffect, useState, useRef } from 'react'
import PinMap from '@/components/Map/PinMap'
import RouteMap from '@/components/Map/RouteMap'
import Title from '@/components/Header/TitleMiddle'
import BottomSheet from './BottomSheet'
import dummyData from '@/data/dummyData.json'
import { loadKakaoMaps } from '@/utils/kakaoLoader'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import MiddleBackButton from '@/components/Buttons/MiddleBackButton'

interface Location {
  lat: number
  lng: number
  name: string
}

interface Participant {
  name: string
  time: string
  icon: string
  lat: number
  lng: number
  transport: string
  transportIcon: string
}

export default function Middle() {
  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null) // 공유된 지도 상태
  const [participants, setParticipants] = useState<Participant[]>([]) // 상태로 관리
  const mapContainerRef = useRef<HTMLDivElement | null>(null) // 지도 컨테이너 참조
  const router = useRouter() // Next.js Router

  const Destination: Location = {
    lat: 37.555134,
    lng: 126.936893,
    name: '신촌역',
  }

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadKakaoMaps()
          .then(() => console.log('Kakao Maps loaded successfully'))
          .catch((error) => console.error('Kakao Maps failed to load:', error))

        if (!window.kakao || !window.kakao.maps) {
          console.error('Kakao maps API not loaded')
          return
        }

        const mapContainer = mapContainerRef.current
        if (!mapContainer) {
          console.error('Map container not found')
          return
        }

        const kakaoMapInstance = new window.kakao.maps.Map(mapContainer, {
          center: new window.kakao.maps.LatLng(
            Destination.lat,
            Destination.lng,
          ),
          level: 4,
        })

        setKakaoMap(kakaoMapInstance)
        console.log('Kakao Map initialized:', kakaoMapInstance)
      } catch (error) {
        console.error('Error initializing Kakao Maps:', error)
      }
    }

    const fetchCurrentLocation = async () => {
      try {
        const location = await getCurrentLocation() // 현재 위치 가져오기
        const myTransport = 'subway' // 내 이동수단 (동적으로 설정 가능)

        const myInfo: Participant = {
          name: '내 위치',
          time: '50분',
          icon: '/globe.svg',
          lat: location.lat,
          lng: location.lng,
          transport: myTransport,
          transportIcon: `/${myTransport}Purple.svg`, // 본인은 항상 Purple
        }

        const updatedParticipants = [
          myInfo, // 내 정보는 맨 앞
          ...dummyData.participants.map((participant) => ({
            ...participant,
            transportIcon: `/${participant.transport}Yellow.svg`, // 타인은 Yellow
          })),
        ]

        setParticipants(updatedParticipants)
        console.log('Updated participants:', updatedParticipants)
      } catch (error) {
        console.error('현재 위치를 가져오지 못했습니다:', error)

        const fallbackTransport = 'subway' // 기본 이동수단
        const fallbackInfo: Participant = {
          name: '기본 위치',
          time: '기본 시간',
          icon: '/globe.svg',
          lat: 37.5665, // 기본값 (서울 중심)
          lng: 126.978,
          transport: fallbackTransport,
          transportIcon: `/${fallbackTransport}Purple.svg`, // 기본 위치도 Purple
        }

        const updatedParticipants = [
          fallbackInfo,
          ...dummyData.participants.map((participant) => ({
            ...participant,
            transportIcon: `/${participant.transport}Yellow.svg`,
          })),
        ]

        setParticipants(updatedParticipants)
      }
    }

    initializeMap()
    fetchCurrentLocation()
  }, [])

  return (
    <div className="flex flex-col h-screen relative">
      {/* 지도 컨테이너 */}
      <div
        className="absolute inset-0 z-0"
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      ></div>

      {/* 지도 및 참가자 정보 */}
      {kakaoMap && participants.length > 0 && (
        <>
          <PinMap
            kakaoMap={kakaoMap} // 공유된 지도 전달
            participants={participants} // participants로 전달
          />

          <RouteMap
            kakaoMap={kakaoMap}
            destination={Destination}
            participants={participants} // 내 위치 포함한 participants 전달
          />
        </>
      )}

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
        />
      </header>

      {/* 뒤로 가기 버튼 */}
      <MiddleBackButton
        onClick={() => router.push('/search')} // Next.js Router로 이동
        style={{
          position: 'relative',
          top: '72px', // 헤더 높이(56px) + 아래 간격(8px)
          left: '10px', // 왼쪽 거리
          zIndex: 2, // 헤더 아래 요소와의 계층 명확히
        }}
      />

      {/* BottomSheet */}
      <BottomSheet
        placeName="신촌역"
        participants={participants} // 수정된 participants 배열 전달
        totalParticipants={participants.length}
      />
    </div>
  )
}
