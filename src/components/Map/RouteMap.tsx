'use client'

import { useEffect, useRef, useState } from 'react'
import { useGroupStore } from '@/store/groupStore'

interface Participant {
  id: number
  name: string
  image: string
  type: string
  locationComplete: string
  scheduleComplete: string
}

interface Location {
  stationName: string
  latitude: number
  longitude: number
}

interface RouteMapProps {
  kakaoMap: kakao.maps.Map
  destinations: Location[]
  currentDestinationIndex: number // 현재 선택된 목적지 인덱스 추가
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const RouteMap: React.FC<RouteMapProps> = ({
  kakaoMap,
  destinations,
  currentDestinationIndex,
}) => {
  const polylineRefs = useRef<kakao.maps.Polyline[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [participantLocations, setParticipantLocations] = useState<
    Record<number, { latitude: number; longitude: number }>
  >({})
  const { selectedGroupId } = useGroupStore()

  useEffect(() => {
    if (!kakaoMap || !selectedGroupId) return

    const fetchParticipants = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/location/${selectedGroupId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )
        if (!response.ok) throw new Error('Failed to fetch locations')

        const data = await response.json()
        if (data.success) {
          const transformedParticipants: Participant[] = [
            {
              id: data.data.myLocation.userId,
              name: data.data.myLocation.username,
              image: data.data.myLocation.userProfile,
              type: 'self',
              locationComplete: 'true',
              scheduleComplete: 'true',
            },
            ...data.data.membersLocation.map((member: any) => ({
              id: member.userId,
              name: member.username,
              image: member.userProfile,
              type: 'participant',
              locationComplete: 'true',
              scheduleComplete: 'true',
            })),
          ]

          const transformedLocations = {
            [data.data.myLocation.userId]: {
              latitude: data.data.myLocation.latitude,
              longitude: data.data.myLocation.longitude,
            },
            ...Object.fromEntries(
              data.data.membersLocation.map((member: any) => [
                member.userId,
                { latitude: member.latitude, longitude: member.longitude },
              ]),
            ),
          }

          setParticipants(transformedParticipants)
          setParticipantLocations(transformedLocations)
        }
      } catch (error) {
        console.error('Failed to load participant locations:', error)
      }
    }

    fetchParticipants()
  }, [selectedGroupId, kakaoMap])

  useEffect(() => {
    if (!kakaoMap || participants.length === 0 || destinations.length === 0)
      return

    // 기존 폴리라인 제거
    polylineRefs.current.forEach((polyline) => polyline.setMap(null))
    polylineRefs.current = []

    // **모든 출발지와 목적지를 포함할 Bounds 객체 생성**
    const bounds = new window.kakao.maps.LatLngBounds()

    // 현재 선택된 목적지 좌표 가져오기
    const selectedDestination = destinations[currentDestinationIndex]

    if (!selectedDestination) {
      console.error('목적지 정보가 없습니다.')
      return
    }

    console.log('경로를 생성할 목적지:', selectedDestination)

    const fetchAndDisplayRoutes = async () => {
      for (const participant of participants) {
        const location = participantLocations[participant.id]
        if (!location) continue

        try {
          const res = await fetch(`${API_BASE_URL}/api/location/get/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', accept: '*/*' },
            body: JSON.stringify({
              startX: location.longitude, // 출발지 X 좌표 (경도)
              startY: location.latitude, // 출발지 Y 좌표 (위도)
              endX: selectedDestination.longitude, // 목적지 X 좌표 (경도)
              endY: selectedDestination.latitude, // 목적지 Y 좌표 (위도)
            }),
          })

          if (!res.ok) {
            console.error(
              '경로 데이터를 가져오는 중 오류 발생:',
              res.statusText,
            )
            continue
          }

          const data = await res.json()
          const routeSegments = data.data.route

          if (!routeSegments || !Array.isArray(routeSegments)) {
            console.error('유효하지 않은 경로 데이터:', data)
            continue
          }

          console.log(`${participant.name}님의 경로 데이터:`, routeSegments)

          const routePath = routeSegments.flatMap((segment: string) =>
            segment.split(' ').map((point) => {
              const [lng, lat] = point.split(',').map(Number)
              return new window.kakao.maps.LatLng(lat, lng)
            }),
          )

          // **출발지 & 목적지를 지도 범위에 추가**
          bounds.extend(
            new window.kakao.maps.LatLng(location.latitude, location.longitude),
          )
          bounds.extend(
            new window.kakao.maps.LatLng(
              selectedDestination.latitude,
              selectedDestination.longitude,
            ),
          )

          const polyline = new window.kakao.maps.Polyline({
            path: routePath,
            strokeWeight: 4,
            strokeColor: participant.type === 'self' ? '#9562FB' : '#AFAFAF',
            strokeOpacity: 0.64,
            strokeStyle: 'solid',
          })

          polyline.setMap(kakaoMap)
          polylineRefs.current.push(polyline)
        } catch (error) {
          console.error(
            '경로 데이터를 가져오거나 표시하는 중 오류 발생:',
            error,
          )
        }
      }

      // **경로가 모두 포함되도록 지도 조정**
      if (!bounds.isEmpty()) {
        kakaoMap.setBounds(bounds, 50) // 50px 여백 추가
      }
    }

    fetchAndDisplayRoutes()

    return () => {
      polylineRefs.current.forEach((polyline) => polyline.setMap(null))
      polylineRefs.current = []
    }
  }, [
    kakaoMap,
    participants,
    participantLocations,
    destinations,
    currentDestinationIndex,
  ])

  return null
}

export default RouteMap
