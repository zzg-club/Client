import { useEffect, useRef, useState } from 'react'
import { getCurrentLocation } from './getCurrentLocation'

const KakaoMap = ({ selectedPlace }) => {
  const mapContainerRef = useRef(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [map, setMap] = useState(null)
  const [currentMarker, setCurrentMarker] = useState(null)

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

          // 사용자 정의 마커 이미지 (32x32 크기 설정)
          const markerImage = new window.kakao.maps.MarkerImage(
            '/myLocation.svg',
            new window.kakao.maps.Size(32, 32), // 이미지 크기 설정
            { offset: new window.kakao.maps.Point(16, 32) } // 중심점 설정
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

  useEffect(() => {
    if (!map || !currentMarker) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLocation = new window.kakao.maps.LatLng(latitude, longitude)

        // 마커 위치 업데이트
        currentMarker.setPosition(newLocation)

        // 지도 중심 업데이트
        map.setCenter(newLocation)

        setCurrentLocation({ lat: latitude, lng: longitude })
      },
      (error) => {
        console.error('위치 추적 중 오류 발생:', error)
      },
      {
        enableHighAccuracy: true, // 고정밀도 위치 사용
        maximumAge: 0, // 캐시된 위치 정보 사용 안 함
        timeout: 5000, // 5초 이상 대기 시 오류 처리
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId) // 위치 추적 중지
    }
  }, [map, currentMarker])

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default KakaoMap
