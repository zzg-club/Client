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
import useWebSocket from '@/hooks/useWebSocket'

interface Participant {
  userId: number
  userName: string
  userProfile: string
  latitude: number
  longitude: number
}

interface Time {
  userId: number
  time: number
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
  const [groupTitle, setGroupTitle] = useState<string>('제목 없는 일정')
  const [time, setTime] = useState<Time[]>([])
  const [isCreator, setIsCreator] = useState<boolean>(false)
  const [recommendedLocations, setRecommendedLocations] = useState<
    RecommendedLocation[]
  >([])
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0)

  const { selectedGroupId } = useGroupStore()
  const { locations } = useWebSocket(selectedGroupId)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const handleTitleChange = (newTitle: string) => {
    setGroupTitle(newTitle) // 제목 변경 상태 저장
  }

  /* 참여자 정보 */
  // 기존 참여자 위치 데이터를 API에서 불러오기
  useEffect(() => {
    if (!selectedGroupId) return

    console.log('fetchParticipants 실행됨 (selectedGroupId):', selectedGroupId)

    const fetchParticipants = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/location/${selectedGroupId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) throw new Error('참여자 위치 데이터 가져오기 실패')

        const data = await response.json()
        console.log('초기 참여자 위치 데이터:', data)

        if (data.success) {
          const newParticipants: Participant[] = []

          // API 데이터 최신화
          if (data.data.myLocation) {
            newParticipants.push({
              userId: data.data.myLocation.userId,
              userName: data.data.myLocation.username,
              userProfile: data.data.myLocation.userProfile || '',
              latitude: data.data.myLocation.latitude,
              longitude: data.data.myLocation.longitude,
            })
          }

          data.data.membersLocation.forEach((member: Participant) => {
            newParticipants.push({
              userId: member.userId,
              userName: member.userName,
              userProfile: member.userProfile || '',
              latitude: member.latitude,
              longitude: member.longitude,
            })
          })

          console.log(
            '`setParticipants()` 실행 (새로운 참여자):',
            newParticipants,
          )

          // 기존 데이터와 다를 때만 업데이트
          setParticipants(newParticipants)
        }
      } catch (error) {
        console.error('초기 참여자 위치 데이터 가져오기 실패:', error)
      }
    }

    fetchParticipants()
  }, [selectedGroupId, API_BASE_URL]) // participants 제거

  useEffect(() => {
    setParticipants((prevParticipants) =>
      prevParticipants.map((p) => ({
        ...p,
        userProfile: p.userProfile.replace('http://', 'https://'), // HTTP -> HTTPS 변환
      })),
    )
  }, [])

  useEffect(() => {
    if (!locations.length) return

    console.log('실시간 참여자 위치 업데이트:', locations)

    setParticipants(
      locations.map((loc) => ({
        userId: loc.userId,
        userName: loc.userName,
        userProfile: loc.userProfile?.replace('http://', 'https://') || '',
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
    )
  }, [locations]) // prevParticipants 제거

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
          setDestination(data.data.stationName) // 첫 번째 추천 장소를 기본값으로 설정
          setTime(data.data)
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

    setCurrentDestinationIndex((prevIndex) => {
      const newIndex =
        direction === 'left'
          ? prevIndex > 0
            ? prevIndex - 1
            : recommendedLocations.length - 1
          : prevIndex < recommendedLocations.length - 1
            ? prevIndex + 1
            : 0

      return newIndex
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
    if (!selectedGroupId || !isCreator) return

    if (destination) {
      return
    }

    const selectedDestination = recommendedLocations[currentDestinationIndex]

    if (!selectedDestination) {
      console.error('확정할 목적지가 없습니다.')
      return
    }

    try {
      // 1️. **목적지 확정 API 호출**
      const response1 = await fetch(
        `${API_BASE_URL}/api/location/threeLocation`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: selectedGroupId,
            midAddress: selectedDestination.stationName,
            latitude: selectedDestination.latitude,
            longitude: selectedDestination.longitude,
          }),
        },
      )

      if (!response1.ok) throw new Error('약속 장소 확정 실패')

      // 2️. **제목 변경 API 호출**
      const response2 = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          groupName: groupTitle,
        }),
      })

      if (!response2.ok) throw new Error('약속 이름 수정 실패')

      console.log('약속 장소 및 제목 변경 완료')

      // 3️. **성공하면 `/schedule`으로 리디렉션**
      router.push('/schedule')
    } catch (error) {
      console.error('확정 실패:', error)
    }
  }

  useEffect(() => {
    console.log('현재 선택된 목적지 인덱스:', currentDestinationIndex)
    console.log(
      '현재 선택된 목적지:',
      recommendedLocations[currentDestinationIndex],
    )
  }, [currentDestinationIndex, recommendedLocations])

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      {/* Suspense 내부에서 검색 파라미터 처리 */}
      <SearchParamsComponent setFrom={setFrom} />
      <div className="flex flex-col h-screen relative">
        <div
          className="absolute inset-0 z-0 w-full h-full"
          ref={mapContainerRef}
        ></div>
        {kakaoMap && recommendedLocations && participants.length > 0 && (
          <>
            <PinMap
              kakaoMap={kakaoMap}
              destinations={recommendedLocations} // 현재 선택된 목적지만 전달
              currentDestinationIndex={currentDestinationIndex}
            />

            <RouteMap
              kakaoMap={kakaoMap}
              destinations={recommendedLocations}
              currentDestinationIndex={currentDestinationIndex}
            />
          </>
        )}
        <header className="absolute top-0 left-0 right-0 shadow-md rounded-b-[24px]">
          <Title
            buttonText="확정"
            buttonLink="#"
            initialTitle="제목 없는 일정"
            onTitleChange={handleTitleChange}
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
          placeName={
            recommendedLocations[currentDestinationIndex]?.stationName || ''
          }
          participants={participants}
          totalParticipants={participants.length}
          time={time}
          onSlideChange={handleSlideChange}
          onConfirm={createMeetingLocation}
        />
      </div>
    </Suspense>
  )
}
