import { useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
import CustomPin from '@/components/Pin/CustomPin'
import DestinationPin from '@/components/Pin/DestinationPin'

interface Participant {
  id: number
  name: string
  time: string
  image: string
  lat: number
  lng: number
  transport: string
  transportIcon: string
  depart: string
}

interface Destination {
  name: string
  lat: number
  lng: number
}

interface PinMapProps {
  kakaoMap: kakao.maps.Map | null
  participants: Participant[]
  destination: Destination
}

const PinMap: React.FC<PinMapProps> = ({
  kakaoMap,
  participants,
  destination,
}) => {
  const overlays = useRef<kakao.maps.CustomOverlay[]>([]) // 기존 핀들을 저장할 배열

  useEffect(() => {
    if (!kakaoMap) {
      console.error('Kakao map is not initialized')
      return
    }

    const bounds = new window.kakao.maps.LatLngBounds()

    // 기존 핀 제거 함수
    const clearOverlays = () => {
      overlays.current.forEach((overlay) => overlay.setMap(null))
      overlays.current = [] // 배열을 초기화하지만 참조 유지
    }

    // 기존 핀 제거
    clearOverlays()

    // 내 위치 핀 추가 (participants 배열의 첫 번째 항목)
    if (participants.length > 0) {
      const myPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          imagePath={participants[0].image}
          isMine={true}
          depart={participants[0].depart}
        />,
      )

      const myOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          participants[0].lat,
          participants[0].lng,
        ),
        content: myPinHtml,
        clickable: true,
      })

      myOverlay.setMap(kakaoMap)
      overlays.current.push(myOverlay) // 배열에 추가
      bounds.extend(
        new window.kakao.maps.LatLng(participants[0].lat, participants[0].lng),
      )
    }

    // 나머지 참여자 핀 추가
    participants.slice(1).forEach((participant) => {
      const participantPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          imagePath={participant.image}
          isMine={false}
          depart={participant.depart}
        />,
      )

      const participantOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          participant.lat,
          participant.lng,
        ),
        content: participantPinHtml,
        clickable: true,
      })

      participantOverlay.setMap(kakaoMap)
      overlays.current.push(participantOverlay) // 배열에 추가
      bounds.extend(
        new window.kakao.maps.LatLng(participant.lat, participant.lng),
      )
    })

    // 목적지 핀 추가
    if (destination) {
      const destinationPinHtml = ReactDOMServer.renderToString(
        <DestinationPin stationName={destination.name} />,
      )

      const destinationOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          destination.lat,
          destination.lng,
        ),
        content: destinationPinHtml,
        clickable: true,
      })

      destinationOverlay.setMap(kakaoMap)
      overlays.current.push(destinationOverlay) // 배열에 추가
      bounds.extend(
        new window.kakao.maps.LatLng(destination.lat, destination.lng),
      )
    }

    // 모든 핀이 포함되도록 지도 범위 설정
    kakaoMap.setBounds(bounds)

    // 컴포넌트 언마운트 시 기존 핀 제거
    return () => clearOverlays()
  }, [kakaoMap, participants, destination])

  return null
}

export default PinMap
