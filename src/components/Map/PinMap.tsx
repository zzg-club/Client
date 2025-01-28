import { useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import CustomPin from '@/components/Pin/CustomPin'
import DestinationPin from '@/components/Pin/DestinationPin'

const PinMap = ({ kakaoMap, participants, destination }) => {
  const overlays = [] // 기존 핀들을 저장할 배열

  useEffect(() => {
    if (!kakaoMap) {
      console.error('Kakao map is not initialized')
      return
    }

    const bounds = new window.kakao.maps.LatLngBounds()

    // 기존 핀 제거 함수
    const clearOverlays = () => {
      overlays.forEach((overlay) => overlay.setMap(null))
      overlays.length = 0 // 배열 초기화
    }

    // 기존 핀 제거
    clearOverlays()

    // 내 위치 핀 추가 (participants 배열의 첫 번째 항목)
    if (participants.length > 0) {
      const myPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          imagePath={participants[0].icon}
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
      overlays.push(myOverlay) // 배열에 추가
      bounds.extend(
        new window.kakao.maps.LatLng(participants[0].lat, participants[0].lng),
      )
    }

    // 나머지 참여자 핀 추가
    participants.slice(1).forEach((participant) => {
      const participantPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          imagePath={participant.icon}
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
      overlays.push(participantOverlay) // 배열에 추가
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
      overlays.push(destinationOverlay) // 배열에 추가
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
