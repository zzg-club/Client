import { useEffect } from 'react'
import ReactDOMServer from 'react-dom/server'
import CustomPin from '@/components/Pin/CustomPin'

const PinMap = ({ kakaoMap, selectedPlace, participants }) => {
  useEffect(() => {
    if (!kakaoMap) {
      console.error('Kakao map is not initialized')
      return
    }

    const bounds = new window.kakao.maps.LatLngBounds()

    // 내 위치 핀 추가
    if (selectedPlace) {
      const myPinHtml = ReactDOMServer.renderToString(
        <CustomPin imagePath="/globe.svg" isMine={true} />,
      )

      const myOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          selectedPlace.lat,
          selectedPlace.lng,
        ),
        content: myPinHtml,
        clickable: true,
      })

      myOverlay.setMap(kakaoMap)
      bounds.extend(
        new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng),
      )
    }

    // 참여자 핀 추가
    participants.forEach((participant) => {
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
  }, [kakaoMap, selectedPlace, participants])

  return null
}

export default PinMap
