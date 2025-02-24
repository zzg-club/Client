'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PinMap from '@/components/Map/PinMap'
import RouteMap from '@/components/Map/RouteMap'
import Title from '@/components/Header/Middle/TitleMiddle'
import BottomSheet from './BottomSheet'
import { loadKakaoMaps } from '@/utils/kakaoLoader'
import BackButton from '@/components/Buttons/Middle/BackButton'
import useWebSocket from '@/hooks/useWebSocket'
import { useGroupStore } from '@/store/groupStore'

interface Participant {
  image: string
  type: string
  locationComplete: string
}

interface RecommendedLocation {
  stationName: string
  latitude: number
  longitude: number
}

// 검색 파라미터를 별도 컴포넌트로 분리 (Suspense 내부에서 실행)
const SearchParamsComponent = ({
  setFrom,
}: {
  setFrom: (value: string) => void
}) => {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/schedule'
  useEffect(() => {
    setFrom(from)
  }, [from, setFrom])
  return null
}

export default function Middle() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [from, setFrom] = useState('/schedule')

  const [kakaoMap, setKakaoMap] = useState<kakao.maps.Map | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [destination, setDestination] = useState<RecommendedLocation | null>(
    null,
  )

  const [isCreator, setIsCreator] = useState<boolean>(false)
  const [recommendedLocations] = useState<RecommendedLocation[]>([])

  const { selectedGroupId } = useGroupStore()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const { locations } = useWebSocket(selectedGroupId)

  useEffect(() => {
    if (!locations.length) return

    console.log('실시간 참여자 위치 업데이트:', locations)

    const updatedParticipants = locations.map((loc) => ({
      id: loc.userId,
      name: loc.userName,
      image: loc.userProfile || '',
      type: 'participant',
      locationComplete: loc.latitude && loc.longitude ? '완료' : '미완료',
      scheduleComplete: '미완료',
    }))

    setParticipants(updatedParticipants)
  }, [locations])

  //  2. 카카오 맵 초기화 (추천 장소 및 참여자 위치 표시)
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadKakaoMaps()
        if (!mapContainerRef.current) return

        const kakaoMapInstance = new window.kakao.maps.Map(
          mapContainerRef.current,
          {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 3,
          },
        )
        setKakaoMap(kakaoMapInstance)
      } catch (error) {
        console.error('Error initializing Kakao Maps:', error)
      }
    }
    initializeMap()
  }, [])

  // 3. 추천 장소 변경 (슬라이드 이동)
  const handleSlideChange = (direction: 'left' | 'right') => {
    if (!recommendedLocations.length) return

    setDestination((prev) => {
      const currentIndex = recommendedLocations.findIndex((loc) => loc === prev)
      const newIndex =
        direction === 'left'
          ? currentIndex > 0
            ? currentIndex - 1
            : recommendedLocations.length - 1
          : currentIndex < recommendedLocations.length - 1
            ? currentIndex + 1
            : 0

      return recommendedLocations[newIndex]
    })
  }

  // 4. 모임장 판별
  useEffect(() => {
    if (!selectedGroupId) return

    const checkCreator = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/members/creator/check/${selectedGroupId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) throw new Error('Failed to check creator status')

        const data = await response.json()
        setIsCreator(data.data) // true이면 모임장, false이면 일반 참여자
      } catch (error) {
        console.error('모임장 확인 실패:', error)
      }
    }

    checkCreator()
  }, [selectedGroupId, API_BASE_URL])

  // 5. 약속 장소 확정 (모임장만 가능)
  const createMeetingLocation = async () => {
    if (!selectedGroupId || !destination || !isCreator) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/location/threeLocation`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedGroupId,
            midAddress: destination.stationName,
            latitude: destination.latitude,
            longitude: destination.longitude,
          }),
        },
      )

      if (!response.ok) throw new Error('Failed to create meeting location')

      console.log('약속 장소 확정 완료')
    } catch (error) {
      console.error('약속 장소 확정 실패:', error)
    }
  }
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      {/* Suspense 내부에서 검색 파라미터 처리 */}
      <SearchParamsComponent setFrom={setFrom} />
      <div className="flex flex-col h-screen relative">
        <div
          className="absolute inset-0 z-0 w-full h-full"
          ref={mapContainerRef}
        ></div>

        {kakaoMap && destination && participants.length > 0 && (
          <>
            <PinMap kakaoMap={kakaoMap} groupId={selectedGroupId} />
            <RouteMap
              kakaoMap={kakaoMap}
              groupId={selectedGroupId}
              destination={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
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
            isDisabled={!isCreator || participants.length < 1}
            onConfirm={createMeetingLocation}
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
          placeName={destination ? destination.stationName : ''}
          participants={participants}
          totalParticipants={participants.length}
          onSlideChange={handleSlideChange}
          onConfirm={createMeetingLocation}
        />
      </div>
    </Suspense>
  )
}
