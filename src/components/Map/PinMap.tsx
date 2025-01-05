import { useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import CustomPin from '@/components/Pin/CustomPin'

const PinMap = ({ kakaoMap, participants }) => {
  useEffect(() => {
    if (!kakaoMap) {
      console.error('Kakao map is not initialized')
      return
    }

    const bounds = new window.kakao.maps.LatLngBounds()

    // 내 위치 핀 추가 (participants 배열의 첫 번째 항목)
    if (participants.length > 0) {
      const myPinHtml = ReactDOMServer.renderToString(
        <CustomPin imagePath={participants[0].icon} isMine={true} />,
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
      bounds.extend(
        new window.kakao.maps.LatLng(participants[0].lat, participants[0].lng),
      )
    }

    // 나머지 참여자 핀 추가
    participants.slice(1).forEach((participant) => {
      const participantPinHtml = ReactDOMServer.renderToString(
        <CustomPin imagePath={participant.icon} isMine={false} />,
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
      bounds.extend(
        new window.kakao.maps.LatLng(participant.lat, participant.lng),
      )
    })

    kakaoMap.setBounds(bounds)
  }, [kakaoMap, participants])

  return null
}

export default PinMap
