'use client'

import { useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
import CustomPin from '@/components/Pin/CustomPin'
import DestinationPin from '@/components/Pin/DestinationPin'
import useWebSocket from '@/hooks/useWebSocket'
import { useGroupStore } from '@/store/groupStore'

interface PinMapProps {
  kakaoMap: kakao.maps.Map | null
  destinations: { stationName: string; latitude: number; longitude: number }[]
}

const PinMap: React.FC<PinMapProps> = ({ kakaoMap, destinations }) => {
  const overlays = useRef<kakao.maps.CustomOverlay[]>([])
  const { selectedGroupId } = useGroupStore()
  const { locations } = useWebSocket(selectedGroupId)

  useEffect(() => {
    if (!kakaoMap || locations.length === 0) return

    const bounds = new window.kakao.maps.LatLngBounds()

    // 기존 핀 제거
    overlays.current.forEach((overlay) => overlay.setMap(null))
    overlays.current = []

    // 참여자 위치 핀 추가
    locations.forEach((location) => {
      const pinHtml = ReactDOMServer.renderToString(<CustomPin />)

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          location.latitude,
          location.longitude,
        ),
        content: pinHtml,
        clickable: true,
      })

      overlay.setMap(kakaoMap)
      overlays.current.push(overlay)
      bounds.extend(
        new window.kakao.maps.LatLng(location.latitude, location.longitude),
      )
    })
    // 모든 핀이 포함되도록 지도 조정
    kakaoMap.setBounds(bounds)

    return () => overlays.current.forEach((overlay) => overlay.setMap(null))
  }, [kakaoMap, locations])

  // 추천 목적지 핀 추가 (Middle에서 받은 destinations 사용)
  useEffect(() => {
    if (!kakaoMap || destinations.length === 0) return

    const bounds = new window.kakao.maps.LatLngBounds()

    destinations.forEach((destination, index) => {
      const destinationPinHtml = ReactDOMServer.renderToString(
        <DestinationPin
          stationName={`${index + 1}. ${destination.stationName}`}
        />,
      )

      const destinationOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          destination.latitude,
          destination.longitude,
        ),
        content: destinationPinHtml,
        clickable: true,
      })

      destinationOverlay.setMap(kakaoMap)
      overlays.current.push(destinationOverlay)
      bounds.extend(
        new window.kakao.maps.LatLng(
          destination.latitude,
          destination.longitude,
        ),
      )
    })

    // 모든 핀이 포함되도록 지도 조정
    kakaoMap.setBounds(bounds)

    return () => overlays.current.forEach((overlay) => overlay.setMap(null))
  }, [kakaoMap, destinations])

  return null
}

export default PinMap
