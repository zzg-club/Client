import { useEffect, useRef } from 'react'

const KakaoMap = ({ selectedPlace }) => {
  const mapContainerRef = useRef(null)

  useEffect(() => {
    const kakaoMapScript = document.createElement('script')
    kakaoMapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
    kakaoMapScript.async = true

    kakaoMapScript.onload = () => {
      window.kakao.maps.load(() => {
        const mapContainer = mapContainerRef.current
        if (!mapContainer) {
          return
        }

        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 초기 중심 좌표
          level: 3,
        }

        const map = new window.kakao.maps.Map(mapContainer, mapOption)

        // 선택된 장소에 따라 지도 중심 이동
        if (selectedPlace) {
          const placePosition = new window.kakao.maps.LatLng(
            selectedPlace.lat,
            selectedPlace.lng,
          )

          const marker = new window.kakao.maps.Marker({
            position: placePosition,
          })

          marker.setMap(map)
          map.setCenter(placePosition)
        }
      })
    }

    document.head.appendChild(kakaoMapScript)

    return () => {
      document.head.removeChild(kakaoMapScript)
    }
  }, [selectedPlace])

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default KakaoMap
