import { create } from 'zustand'

interface LocationState {
  selectedLocation?: { place: string; lat: number; lng: number }
  nearestTransit?: string
  setSelectedLocation: (location?: {
    place: string
    lat: number
    lng: number
  }) => void
  fetchNearestTransit: () => Promise<void>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const transitStore = create<LocationState>((set, get) => ({
  selectedLocation: undefined,
  nearestTransit: undefined,

  setSelectedLocation: (location) => {
    set({ selectedLocation: location })
    if (location) {
      get().fetchNearestTransit()
    }
  },

  fetchNearestTransit: async () => {
    const { selectedLocation } = get()
    if (!selectedLocation) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/transit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        }),
      })

      if (!response.ok)
        throw new Error(`가장 가까운 역 검색 실패: ${response.status}`)

      const data = await response.json()
      if (data.success && data.data.transitName) {
        set({ nearestTransit: data.data.transitName })
      } else {
        set({ nearestTransit: '역 정보를 찾을 수 없음' })
      }
    } catch (error) {
      console.error('가장 가까운 역 조회 오류:', error)
      set({ nearestTransit: '조회 실패' })
    }
  },
}))
