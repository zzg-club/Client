'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PinMap from '@/components/Map/PinMap'
import RouteMap from '@/components/Map/RouteMap'
import Title from '@/components/Header/Middle/TitleMiddle'
import BottomSheet from './BottomSheet'
import { loadKakaoMaps } from '@/utils/kakaoLoader'
import BackButton from '@/components/Buttons/Middle/BackButton'
import { useGroupStore } from '@/store/groupStore'
import { useWebSocketStore } from '@/store/websocketStore'

interface Participant {
  userId: number
  userName: string
  userProfile: string
  latitude: number
  longitude: number
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
  const [participants] = useState<Participant[]>([])
  const [destination, setDestination] = useState<RecommendedLocation | null>(
    null,
  )
const { connectWebSocket, subscribeLocation } = useWebSocketStore()
  const [isCreator, setIsCreator] = useState<boolean>(false)
  const [recommendedLocations, setRecommendedLocations] = useState<
    RecommendedLocation[]
  >([])

  const { selectedGroupId } = useGroupStore()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  /* 참여자 정보 */
  // 기존 참여자 위치 데이터를 API에서 불러오기
  useEffect(() => {
    if (!selectedGroupId) return
  
    // 1️. 기존 참여자의 위치 데이터 가져오기
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/location/${selectedGroupId}`, {
          method: 'GET',
          credentials: 'include',
        })
  
        if (!response.ok) throw new Error('참여자 위치 데이터 가져오기 실패')
  
        const data = await response.json()
        console.log('초기 참여자 위치 데이터:', data)
  
        if (data.success) {
          const initialParticipants: Participant[] = []
  
          // 내 위치 추가
          if (data.data.myLocation) {
            initialParticipants.push({
              userId: data.data.myLocation.userId,
              userName: data.data.myLocation.username,
              userProfile: data.data.myLocation.userProfile || '',
              latitude: data.data.myLocation.latitude,
              longitude: data.data.myLocation.longitude,
            })
          }
  
          // 다른 참여자 위치 추가
          data.data.membersLocation.forEach((member: any) => {
            initialParticipants.push({
              userId: member.userId,
              userName: member.username,
              userProfile: member.userProfile || '',
              latitude: member.latitude,
              longitude: member.longitude,
            })
          })
  
          setParticipants(initialParticipants)
  
          // 2️. WebSocket 연결 실행 (초기 데이터 세팅 후 실행)
          connectWebSocket(selectedGroupId)
  
          // 3️. WebSocket 구독 실행 (초기 데이터 세팅 후 실행)
          subscribeLocation(selectedGroupId)
        }
      } catch (error) {
        console.error('초기 참여자 위치 데이터 가져오기 실패:', error)
      }
    }
  
    fetchParticipants()
  }, [selectedGroupId, connectWebSocket, subscribeLocation])
  
  //  1. 카카오 맵 초기화 (추천 장소 및 참여자 위치 표시)
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

  // 2. 추천 중간 지점 가져오기
  useEffect(() => {
    if (!selectedGroupId) return

    const fetchRecommendedLocations = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/location/threeLocation/${selectedGroupId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) throw new Error('추천 장소 가져오기 실패')

        const data = await response.json()
        console.log('추천 중간 지점:', data)

        if (data.success && data.data.length > 0) {
          setRecommendedLocations(data.data)
          setDestination(data.data[0]) // 첫 번째 추천 장소를 기본값으로 설정
        }
      } catch (error) {
        console.error('추천 장소 가져오기 실패:', error)
      }
    }

    fetchRecommendedLocations()
  }, [selectedGroupId, API_BASE_URL])

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
            <PinMap kakaoMap={kakaoMap} destinations={recommendedLocations} />
            <RouteMap kakaoMap={kakaoMap} destinations={recommendedLocations} />
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
