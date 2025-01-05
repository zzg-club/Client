import { useEffect } from 'react'

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
  selectedPlace: Location // 내 현재 위치 추가
}

const RouteMap: React.FC<RouteMapProps> = ({
  kakaoMap,
  destination,
  participants,
  selectedPlace,
}) => {
  useEffect(() => {
    if (!kakaoMap) {
      return
    }

    // CSS 변수 가져오기
    const rootStyles = getComputedStyle(document.documentElement)
    const mainColor =
      rootStyles.getPropertyValue('--MainColor').trim() || '#9562FB'
    const subwayTimeColor =
      rootStyles.getPropertyValue('--subway_time').trim() || '#FFCF33'

    // 참여자 경로 추가
    participants.forEach((participant) => {
      const participantLinePath = [
        new window.kakao.maps.LatLng(participant.lat, participant.lng),
        new window.kakao.maps.LatLng(destination.lat, destination.lng),
      ]

      const participantPolyline = new window.kakao.maps.Polyline({
        path: participantLinePath,
        strokeWeight: 4,
        strokeColor: subwayTimeColor,
        strokeOpacity: 0.64,
        strokeStyle: 'solid',
      })

      participantPolyline.setMap(kakaoMap)
    })

    // 내 경로 추가
    if (selectedPlace) {
      const myLinePath = [
        new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng),
        new window.kakao.maps.LatLng(destination.lat, destination.lng),
      ]

      const myPolyline = new window.kakao.maps.Polyline({
        path: myLinePath,
        strokeWeight: 4,
        strokeColor: mainColor,
        strokeOpacity: 0.64,
        strokeStyle: 'solid',
      })

      myPolyline.setMap(kakaoMap)
    }
  }, [kakaoMap, destination, participants, selectedPlace])

  return null
}

export default RouteMap
