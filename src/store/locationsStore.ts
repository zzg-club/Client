import { create } from 'zustand'

interface LocationState {
  selectedLocation: { place: string; lat: number; lng: number } | null
  nearestTransit: string | null
  setSelectedLocation: (
    location: { place: string; lat: number; lng: number } | null,
  ) => void // null 허용
  setNearestTransit: (transit: string) => void
  clearSelectedLocation: () => void
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedLocation: null,
  nearestTransit: null,

  // `useCallback`을 사용하여 불필요한 렌더링 방지
  setSelectedLocation: (location) => {
    set((state) => {
      // location이 null이면 초기화
      if (!location) {
        return { selectedLocation: null }
      }

      // 같은 값이면 업데이트하지 않음
      if (state.selectedLocation?.place === location.place) {
        return state
      }

      return { selectedLocation: location }
    })
  },

  setNearestTransit: (transit) => set({ nearestTransit: transit }),

  clearSelectedLocation: () =>
    set({ selectedLocation: null, nearestTransit: null }),
}))
