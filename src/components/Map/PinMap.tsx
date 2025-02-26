'use client'

import { useEffect, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import CustomPin from '@/components/Pin/CustomPin'
import DestinationPin from '@/components/Pin/DestinationPin'
import { useGroupStore } from '@/store/groupStore'

interface PinMapProps {
  kakaoMap: kakao.maps.Map | null
  destinations: { stationName: string; latitude: number; longitude: number }[]
  currentDestinationIndex: number
}

interface MyLocation {
  userId: number
  username: string
  userProfile: string
  latitude: number
  longitude: number
  transitName?: string
}

interface MemberLocation {
  userId: number
  username: string
  userProfile: string
  latitude: number
  longitude: number
  transitName?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const PinMap: React.FC<PinMapProps> = ({
  kakaoMap,
  destinations,
  currentDestinationIndex,
}) => {
  const overlays = useRef<kakao.maps.CustomOverlay[]>([])
  const { selectedGroupId } = useGroupStore()
  const destinationOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null)

  // 상태 분리 (내 위치 & 멤버 위치)
  const [myLocation, setMyLocation] = useState<MyLocation | null>(null)
  const [membersLocation, setMembersLocation] = useState<MemberLocation[]>([])

  useEffect(() => {
    if (!selectedGroupId) return

    const fetchLocationData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/location/${selectedGroupId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) throw new Error('Failed to fetch location data')

        const data = await response.json()
        console.log('📍 참여자 위치 데이터:', data)

        if (!data.success) return

        // 내 위치 저장
        if (data.data.myLocation) {
          setMyLocation({
            userId: data.data.myLocation.userId,
            username: data.data.myLocation.username,
            userProfile: data.data.myLocation.userProfile || '',
            latitude: data.data.myLocation.latitude,
            longitude: data.data.myLocation.longitude,
          })
        }

        // 멤버 위치 저장
        const members: MemberLocation[] = data.data.membersLocation.map(
          (member: any) => ({
            userId: member.userId,
            username: member.username,
            userProfile: member.userProfile || '',
            latitude: member.latitude,
            longitude: member.longitude,
          }),
        )

        setMembersLocation(members)
      } catch (error) {
        console.error('❌ 참여자 위치 데이터 조회 실패:', error)
      }
    }

    fetchLocationData()
  }, [selectedGroupId])

  // 📌 지도에 위치 추가 (내 위치 + 멤버 위치 + 목적지)
  useEffect(() => {
    if (!kakaoMap) return

    const bounds = new window.kakao.maps.LatLngBounds()
    overlays.current.forEach((overlay) => overlay.setMap(null))
    overlays.current = []

    // 📍 내 위치 추가
    if (myLocation) {
      const myPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          latitude={myLocation.latitude}
          longitude={myLocation.longitude}
          transitName={myLocation.transitName || 'OO역'}
          isMine={true}
          userProfile={myLocation.userProfile}
        />,
      )

      const myOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          myLocation.latitude,
          myLocation.longitude,
        ),
        content: myPinHtml,
        clickable: true,
      })

      myOverlay.setMap(kakaoMap)
      overlays.current.push(myOverlay)
      bounds.extend(
        new window.kakao.maps.LatLng(myLocation.latitude, myLocation.longitude),
      )
    }

    // 📍 멤버 위치 추가
    membersLocation.forEach((member) => {
      const memberPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          latitude={member.latitude}
          longitude={member.longitude}
          transitName={member.transitName || '출발지 미정'}
          isMine={false}
          userProfile={member.userProfile}
        />,
      )

      const memberOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          member.latitude,
          member.longitude,
        ),
        content: memberPinHtml,
        clickable: true,
      })

      memberOverlay.setMap(kakaoMap)
      overlays.current.push(memberOverlay)
      bounds.extend(
        new window.kakao.maps.LatLng(member.latitude, member.longitude),
      )
    })

    // 📌 **현재 선택된 목적지 핀만 표시**
    if (
      destinations.length > 0 &&
      currentDestinationIndex < destinations.length
    ) {
      const destination = destinations[currentDestinationIndex]
      console.log('📍 추가할 목적지:', destination)

      const destinationPinHtml = ReactDOMServer.renderToString(
        <DestinationPin stationName={`${destination.stationName}`} />,
      )

      // **이전 목적지 핀 제거**
      if (destinationOverlayRef.current) {
        destinationOverlayRef.current.setMap(null)
      }

      // **새로운 목적지 핀 추가**
      const destinationOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          destination.latitude,
          destination.longitude,
        ),
        content: destinationPinHtml,
        clickable: true,
      })

      destinationOverlay.setMap(kakaoMap)
      destinationOverlayRef.current = destinationOverlay

      bounds.extend(
        new window.kakao.maps.LatLng(
          destination.latitude,
          destination.longitude,
        ),
      )
    }

    // 📌 **모든 핀이 포함되도록 지도 조정**
    if (!bounds.isEmpty()) {
      kakaoMap.setBounds(bounds, 50) // 50px 여백 추가
    }

    return () => {
      overlays.current.forEach((overlay) => overlay.setMap(null))
      if (destinationOverlayRef.current) {
        destinationOverlayRef.current.setMap(null)
      }
    }
  }, [
    kakaoMap,
    myLocation,
    membersLocation,
    destinations,
    currentDestinationIndex,
  ])

  return null
}

export default PinMap
