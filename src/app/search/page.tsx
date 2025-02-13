'use client'

import React, { Suspense } from 'react'
import { SearchPage } from '@/components/Search'

const Search = () => {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}
export default Search
