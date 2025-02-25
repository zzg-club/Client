import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Location 타입 정의
interface Location {
  place: string
  lat: number
  lng: number
}

// Zustand 스토어 정의
interface LocationState {
  selectedLocation: Location | null
  setSelectedLocation: (location: Location | null) => void
  clearSelectedLocation: () => void
}

// Zustand + persist 미들웨어 적용
export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      selectedLocation: null, // 초기 상태 (선택한 위치 없음)

      /** 위치 선택 시 자동 저장 (기존 값과 다를 경우에만 업데이트) */
      setSelectedLocation: (location) => {
        if (
          JSON.stringify(get().selectedLocation) !== JSON.stringify(location)
        ) {
          set({ selectedLocation: location }) // Zustand 상태 업데이트
        }
      },

      /** 위치 초기화 (localStorage에서도 삭제) */
      clearSelectedLocation: () => {
        set({ selectedLocation: null }) // Zustand 상태 초기화
      },
    }),
    {
      name: 'location-storage', // localStorage 저장 키 이름
    },
  ),
)
