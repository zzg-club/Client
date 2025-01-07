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
  participants: Participant[] // participants 배열로 내 위치 포함
}

const RouteMap: React.FC<RouteMapProps> = ({
  kakaoMap,
  destination,
  participants,
}) => {
  useEffect(() => {
    if (!kakaoMap || participants.length === 0) {
      return
    }

    // CSS 변수 가져오기
    const rootStyles = getComputedStyle(document.documentElement)
    const mainColor =
      rootStyles.getPropertyValue('--MainColor').trim() || '#9562FB'
    const subwayTimeColor =
      rootStyles.getPropertyValue('--subway_time').trim() || '#FFCF33'

    // 내 위치 (participants[0]) 경로 추가
    const myLocation = participants[0] // 내 위치를 participants 배열의 첫 번째 요소로 간주
    const myLinePath = [
      new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
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

    // 나머지 참여자 경로 추가
    participants.slice(1).forEach((participant) => {
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
  }, [kakaoMap, destination, participants])

  return null
}

export default RouteMap
