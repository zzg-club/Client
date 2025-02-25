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
}

const RouteMap: React.FC<RouteMapProps> = ({ kakaoMap, destinations }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
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
  }, [selectedGroupId,API_BASE_URL, kakaoMap])

  useEffect(() => {
    if (!kakaoMap || participants.length === 0) return

    polylineRefs.current.forEach((polyline) => polyline.setMap(null))
    polylineRefs.current = []

    const fetchAndDisplayRoutes = async () => {
      for (const participant of participants) {
        const location = participantLocations[participant.id]
        if (!location) continue

        try {
          const res = await fetch(`${API_BASE_URL}/api/location/get/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', accept: '*/*' },
            body: JSON.stringify({
              startX: location.longitude, // 경로 시작 X 좌표 (경도)
              startY: location.latitude, // 경로 시작 Y 좌표 (위도)
              endX: destinations.longitude, // 목적지 X 좌표 (경도)
              endY: destinations.latitude, // 목적지 Y 좌표 (위도)
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

          const routePath = routeSegments.flatMap((segment: string) =>
            segment.split(' ').map((point) => {
              const [lng, lat] = point.split(',').map(Number)
              return new window.kakao.maps.LatLng(lat, lng)
            }),
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
    }

    fetchAndDisplayRoutes()

    return () => {
      polylineRefs.current.forEach((polyline) => polyline.setMap(null))
      polylineRefs.current = []
    }
  }, [kakaoMap, participants, participantLocations, destinations, API_BASE_URL])

  return null
}

export default RouteMap
