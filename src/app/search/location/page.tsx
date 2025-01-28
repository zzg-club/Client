'use client'

import React from 'react'
import { LocationPage } from '@/components/Search'
import { useSearchParams } from 'next/navigation'

const Location = () => {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const handleLocationClick = () => {
    if (from === '/place') {
      //플레이스 탭에서 왔다면
      window.location.href = `/place`
    } else {
      window.location.href = `/letsmeet/middle?from=${from}`
    }
  }
  return <LocationPage onLocationClick={handleLocationClick} />
}

export default Location
