import { useEffect, useRef } from 'react'

interface Participant {
  name: string
  lat: number
  lng: number
}

interface Location {
  lat: number
  lng: number
}

interface RouteMapProps {
  kakaoMap: kakao.maps.Map
  destination: Location
  participants: Participant[]
}

const RouteMap: React.FC<RouteMapProps> = ({
  kakaoMap,
  destination,
  participants,
}) => {
  const polylineRefs = useRef<kakao.maps.Polyline[]>([])

  useEffect(() => {
    if (!kakaoMap || participants.length === 0) {
      return
    }

    // 이전 `Polyline` 제거
    polylineRefs.current.forEach((polyline) => {
      polyline.setMap(null)
    })
    polylineRefs.current = [] // 참조 초기화

    const fetchAndDisplayRoutes = async () => {
      const nonSelfParticipants = participants.filter(
        (participant) => participant.name !== '내 위치',
      )
      const selfParticipant = participants.find(
        (participant) => participant.name === '내 위치',
      )
      // 내 경로 표시 (마지막에 추가)
      if (selfParticipant) {
        try {
          const res = await fetch(
            'https://api.moim.team/api/location/get/route',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                accept: '*/*',
              },
              body: JSON.stringify({
                startX: selfParticipant.lng,
                startY: selfParticipant.lat,
                endX: destination.lng,
                endY: destination.lat,
              }),
            },
          )

          if (!res.ok) {
            console.error(
              '내 경로 데이터를 가져오는 중 오류 발생:',
              res.statusText,
            )
            return
          }

          const data = await res.json()
          const routeSegments = data.data.route

          if (!routeSegments || !Array.isArray(routeSegments)) {
            console.error('유효하지 않은 내 경로 데이터:', data)
            return
          }

          const routePath = routeSegments.flatMap((segment: string) =>
            segment.split(' ').map((point) => {
              const [lng, lat] = point.split(',').map(Number)
              return new window.kakao.maps.LatLng(lat, lng)
            }),
          )

          const polyline = new window.kakao.maps.Polyline({
            path: routePath,
            strokeWeight: 4, // 내 경로를 강조
            strokeColor: '#9562FB', // 내 경로 색상
            strokeOpacity: 0.64,
            strokeStyle: 'solid',
          })

          polyline.setMap(kakaoMap)
          polylineRefs.current.push(polyline) // Polyline 참조 저장
        } catch (error) {
          console.error(
            '내 경로 데이터를 가져오거나 표시하는 중 오류 발생:',
            error,
          )
        }
      }

      // 참여자 경로 표시 (내 위치 제외)
      for (const participant of nonSelfParticipants) {
        try {
          const res = await fetch(
            'https://api.moim.team/api/location/get/route',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                accept: '*/*',
              },
              body: JSON.stringify({
                startX: participant.lng,
                startY: participant.lat,
                endX: destination.lng,
                endY: destination.lat,
              }),
            },
          )

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
            strokeColor: '#FFCF33', // 참여자 경로 색상
            strokeOpacity: 0.64,
            strokeStyle: 'solid',
          })

          polyline.setMap(kakaoMap)
          polylineRefs.current.push(polyline) // Polyline 참조 저장
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
      // 컴포넌트 언마운트 시 기존 Polyline 제거
      polylineRefs.current.forEach((polyline) => polyline.setMap(null))
      polylineRefs.current = []
    }
  }, [kakaoMap, destination, participants])

  return null
}

export default RouteMap
