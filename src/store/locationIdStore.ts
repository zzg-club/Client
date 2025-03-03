import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationIdState {
  selectedLocationId: number | null
  setSelectedLocationId: (id: number) => void
  clearSelectedLocationId: () => void
}

export const useLocationIdStore = create(
  persist<LocationIdState>(
    (set) => ({
      selectedLocationId: null,
      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      clearSelectedLocationId: () => {
        set({ selectedLocationId: null })
        localStorage.removeItem('location-storage')
      },
    }),
    {
      name: 'location-storage',
    },
  ),
)
