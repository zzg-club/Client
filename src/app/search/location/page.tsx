'use client'

import React, { Suspense, useEffect, useState } from 'react'
import LocationPage from '@/components/Search/LocationPage'
import { useSearchParams, useRouter } from 'next/navigation'

const LocationComponent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const isDirectModal = searchParams.get('direct') === 'true' // URL에서 direct 여부 확인

  const handleLocationClick = (location: {
    place: string
    lat: number
    lng: number
  }) => {
    if (from === '/place') {
      // 플레이스 탭에서 왔다면 /place로 이동
      router.push('/place')
    } else if (isDirectModal) {
      // `direct=true`일 경우, `LetsMeet` 페이지로 이동 후 모달 자동 활성화
      router.push(
        `/letsmeet?direct=true&place=${encodeURIComponent(location.place)}&lat=${location.lat}&lng=${location.lng}`,
      )
    } else {
      // `direct=false`일 경우 middle 페이지로 이동
      router.push(`/letsmeet/middle?from=${from}`)
    }
  }

  return (
    <div className="relative pointer-events-auto">
      <LocationPage
        onLocationClick={handleLocationClick}
        isDirectModal={isDirectModal}
      />
    </div>
  )
}

const Location = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocationComponent />
    </Suspense>
  )
}

export default Location
