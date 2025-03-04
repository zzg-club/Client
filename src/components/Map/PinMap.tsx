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

  const fixProfileUrl = (url: string | undefined) => {
    if (!url || url.includes('default_profile.jpeg')) {
      return 'https://t1.kakaocdn.net/account_images/default_profile.jpeg' // HTTPS 기본 프로필
    }

    console.log(`원본 프로필 URL: ${url}`)

    // 강제 변환: `img1.kakaocdn.net` → `t1.kakaocdn.net`
    let fixedUrl = url
      .replace(/^http:/, 'https:') // HTTP → HTTPS
      .replace('img1.kakaocdn.net', 't1.kakaocdn.net') // 서브도메인 강제 변경

    // `?fname=`가 있는 경우, 뒤의 URL만 사용
    if (fixedUrl.includes('?fname=')) {
      fixedUrl = fixedUrl.split('?fname=')[1]
    }

    console.log(`변환된 프로필 URL: ${fixedUrl}`)
    return fixedUrl
  }

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

        if (!data.success) return

        // 내 위치 저장
        if (data.data.myLocation) {
          setMyLocation({
            userId: data.data.myLocation.userId,
            username: data.data.myLocation.username,
            userProfile: fixProfileUrl(data.data.myLocation.userProfile) || '',
            latitude: data.data.myLocation.latitude,
            longitude: data.data.myLocation.longitude,
          })
        }

        // 멤버 위치 저장
        const members: MemberLocation[] = data.data.membersLocation.map(
          (member: {
            userId: number
            username: string
            userProfile?: string
            latitude: number
            longitude: number
          }) => ({
            userId: member.userId,
            username: member.username,
            userProfile: fixProfileUrl(member.userProfile) || '',
            latitude: member.latitude,
            longitude: member.longitude,
          }),
        )

        setMembersLocation(members)
        console.log(
          '나 데이터',
          myLocation,
          '참여자 위치 데이터:',
          membersLocation,
        )
      } catch (error) {
        console.error('참여자 위치 데이터 조회 실패:', error)
      }
    }

    fetchLocationData()
  }, [selectedGroupId])

  const fetchTransitName = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ latitude, longitude }),
      })

      if (!response.ok) throw new Error('가까운 지하철역 탐색 실패')

      const data = await response.json()
      return data.success ? data.data.transitName : '출발지 미정'
    } catch (error) {
      console.error('Transit API 호출 오류:', error)
      return '출발지 미정'
    }
  }

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
        console.log('참여자 위치 데이터:', data)

        if (!data.success) return

        // 내 위치 transitName 업데이트
        if (data.data.myLocation) {
          const transitName = await fetchTransitName(
            data.data.myLocation.latitude,
            data.data.myLocation.longitude,
          )
          setMyLocation({
            userId: data.data.myLocation.userId,
            username: data.data.myLocation.username,
            userProfile: fixProfileUrl(data.data.myLocation.userProfile) || '',
            latitude: data.data.myLocation.latitude,
            longitude: data.data.myLocation.longitude,
            transitName,
          })
        }

        // 멤버 위치 transitName 업데이트
        const members: MemberLocation[] = await Promise.all(
          data.data.membersLocation.map(
            async (member: {
              userId: number
              username: string
              userProfile?: string
              latitude: number
              longitude: number
            }) => {
              const transitName = await fetchTransitName(
                member.latitude,
                member.longitude,
              )
              return {
                userId: member.userId,
                username: member.username,
                userProfile: fixProfileUrl(member.userProfile) || '',
                latitude: member.latitude,
                longitude: member.longitude,
                transitName,
              }
            },
          ),
        )

        setMembersLocation(members)
      } catch (error) {
        console.error('참여자 위치 데이터 조회 실패:', error)
      }
    }

    fetchLocationData()
  }, [selectedGroupId])

  // 지도에 위치 추가 (내 위치 + 멤버 위치 + 목적지)
  useEffect(() => {
    if (!kakaoMap) return

    const bounds = new window.kakao.maps.LatLngBounds()
    overlays.current.forEach((overlay) => overlay.setMap(null))
    overlays.current = []

    // 내 위치 추가
    if (myLocation) {
      const myPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          latitude={myLocation.latitude}
          longitude={myLocation.longitude}
          transitName={myLocation.transitName || 'OO역'}
          isMine={true}
          userProfile={fixProfileUrl(myLocation.userProfile)}
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

    // 멤버 위치 추가
    membersLocation.forEach((member) => {
      const memberPinHtml = ReactDOMServer.renderToString(
        <CustomPin
          latitude={member.latitude}
          longitude={member.longitude}
          transitName={member.transitName || '출발지 미정'}
          isMine={false}
          userProfile={fixProfileUrl(member.userProfile)}
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

    // **현재 선택된 목적지 핀만 표시**
    if (
      destinations.length > 0 &&
      currentDestinationIndex < destinations.length
    ) {
      const destination = destinations[currentDestinationIndex]
      console.log('추가할 목적지:', destination)

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

    // **모든 핀이 포함되도록 지도 조정**
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
