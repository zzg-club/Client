'use client'

import React, { useEffect, useState, useRef } from 'react'
import PinMap from '@/components/Map/PinMap'
import RouteMap from '@/components/Map/RouteMap'
import Title from '@/components/Header/TitleMiddle'
import BottomSheet from './BottomSheet'
import dummyData from '@/data/dummyData.json'
import { loadKakaoMaps } from '@/utils/kakaoLoader'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'

interface Location {
  lat: number
  lng: number
  name: string
}

export default function Middle() {
  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null) // 공유된 지도 상태
  const mapContainerRef = useRef<HTMLDivElement | null>(null) // 지도 컨테이너 참조

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
        const myInfo = {
          name: '내 위치',
          time: '현재 위치',
          icon: '/globe.svg',
          lat: location.lat,
          lng: location.lng,
          transportIcon: '/subway.svg',
          station: '내 주변역',
        }

        // 내 정보를 participants 배열의 맨 앞에 추가
        dummyData.participants = [myInfo, ...dummyData.participants]
        console.log('현재 위치 및 내 정보 추가:', myInfo)
      } catch (error) {
        console.error('현재 위치를 가져오지 못했습니다:', error)
        const fallbackInfo = {
          name: '기본 위치',
          time: '기본 시간',
          icon: '/globe.svg',
          lat: 37.5665, // 기본값 (서울 중심)
          lng: 126.978,
          transportIcon: '/subway.svg',
          station: '서울역',
        }
        dummyData.participants = [fallbackInfo, ...dummyData.participants]
        console.log('기본 위치 설정:', fallbackInfo)
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
      {kakaoMap && dummyData.participants.length > 0 && (
        <>
          <PinMap
            kakaoMap={kakaoMap} // 공유된 지도 전달
            participants={dummyData.participants} // participants로 전달
          />

          <RouteMap
            kakaoMap={kakaoMap}
            destination={Destination}
            participants={dummyData.participants} // 내 위치 포함한 participants 전달
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

      {/* BottomSheet */}
      <BottomSheet
        placeName="신촌역"
        participants={dummyData.participants} // 수정된 participants 배열 전달
        totalParticipants={dummyData.participants.length}
      />
    </div>
  )
}
