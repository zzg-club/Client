import { useState, useEffect } from 'react'
import { fetchFilters } from '@/app/api/places/filter/route'
import { Place } from '@/types/place'

export const usePlaceFilters = (placeData: Place) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    const getActiveFilters = async () => {
      try {
        const filterResponse = await fetchFilters()
        const filterData = await filterResponse.json()

        if (!filterData.success || !Array.isArray(filterData.data)) return []

        const categoryFilters = filterData.data[placeData.category]
        if (!categoryFilters) return []

        const { filters } = categoryFilters
        const activeFilters = Object.keys(filters)
          .filter((key): key is keyof Place => key in placeData && placeData[key as keyof Place] === true)
          .map((key) => filters[key])

        setActiveFilters(activeFilters)
      } catch (error) {
        console.error('필터 가져오기 오류:', error)
      }
    }

    getActiveFilters()
  }, [placeData])

  return { activeFilters }
}