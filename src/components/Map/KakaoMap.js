import { useEffect, useRef, useState } from 'react'
import { getCurrentLocation } from './getCurrentLocation'

const KakaoMap = ({ selectedPlace, onMoveToCurrentLocation }) => {
  const mapContainerRef = useRef(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [map, setMap] = useState(null)
  const [currentMarker, setCurrentMarker] = useState(null)

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      const location = await getCurrentLocation()
      setCurrentLocation(location)

      const kakaoMapScript = document.createElement('script')
      kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
      kakaoMapScript.async = true

      kakaoMapScript.onload = () => {
        window.kakao.maps.load(() => {
          const mapContainer = mapContainerRef.current
          if (!mapContainer) return

          const mapOption = {
            center: new window.kakao.maps.LatLng(location.lat, location.lng),
            level: 3,
          }

          const kakaoMap = new window.kakao.maps.Map(mapContainer, mapOption)

          const markerImage = new window.kakao.maps.MarkerImage(
            '/myLocation.svg',
            new window.kakao.maps.Size(32, 32),
            { offset: new window.kakao.maps.Point(16, 32) },
          )

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(location.lat, location.lng),
            image: markerImage,
          })
          marker.setMap(kakaoMap)

          setMap(kakaoMap)
          setCurrentMarker(marker)
        })
      }

      document.head.appendChild(kakaoMapScript)

      return () => {
        document.head.removeChild(kakaoMapScript)
      }
    }

    initializeMap()
  }, [])

  // 현재 위치로 이동
  const moveToCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation()
      const newLocation = new window.kakao.maps.LatLng(
        location.lat,
        location.lng,
      )

      // 지도와 마커 위치 업데이트
      if (map) map.setCenter(newLocation)
      if (currentMarker) currentMarker.setPosition(newLocation)

      setCurrentLocation(location)
    } catch (error) {
      console.error('현재 위치로 이동 중 오류:', error)
    }
  }

  // 외부 이벤트와 연동
  useEffect(() => {
    if (onMoveToCurrentLocation) {
      onMoveToCurrentLocation(moveToCurrentLocation)
    }
  }, [onMoveToCurrentLocation, moveToCurrentLocation])

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default KakaoMap
