import { useEffect, useRef, useState } from 'react'
import { getCurrentLocation } from './getCurrentLocation'
import CustomPin from '@/components/Pin/CustomPin'
import ReactDOMServer from 'react-dom/server'

const PinMap = ({ selectedPlace, participants, onMoveToCurrentLocation }) => {
  const mapContainerRef = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    const initializeMap = async () => {
      const location = await getCurrentLocation()

      const kakaoMapScript = document.createElement('script')
      kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
      kakaoMapScript.async = true

      kakaoMapScript.onload = () => {
        if (!window.kakao || !window.kakao.maps) return

        window.kakao.maps.load(() => {
          const mapContainer = mapContainerRef.current
          if (!mapContainer) return

          const kakaoMap = new window.kakao.maps.Map(mapContainer, {
            center: new window.kakao.maps.LatLng(location.lat, location.lng),
            level: 3,
          })

          const bounds = new window.kakao.maps.LatLngBounds()

          // 내 위치 핀 추가 (노란색)
          const myPinHtml = ReactDOMServer.renderToString(
            <CustomPin imagePath="/globe.svg" isMine={true} />, // 본인 핀
          )

          const myOverlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(location.lat, location.lng),
            content: myPinHtml,
            clickable: true,
          })
          myOverlay.setMap(kakaoMap)
          bounds.extend(
            new window.kakao.maps.LatLng(location.lat, location.lng),
          )

          // 참여자 핀 추가 (보라색)
          participants.forEach((participant) => {
            const participantPinHtml = ReactDOMServer.renderToString(
              <CustomPin imagePath={participant.icon} isMine={false} />, // 다른 사람 핀
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
          setMap(kakaoMap)
        })
      }

      document.head.appendChild(kakaoMapScript)

      return () => {
        document.head.removeChild(kakaoMapScript)
      }
    }

    initializeMap()
  }, [participants])

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default PinMap
