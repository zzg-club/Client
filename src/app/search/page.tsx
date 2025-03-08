'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { SearchPage } from '@/components/Search'

const Search = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true) // 클라이언트에서만 렌더링되도록 설정
  }, [])

  if (!isClient) {
    return null // 서버에서는 아무것도 렌더링하지 않음
  }

  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}

export default Search
