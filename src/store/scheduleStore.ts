import { create } from 'zustand'

interface ScheduleState {
  selectedScheduleId: number | null
  setSelectedScheduleId: (id: number) => void
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedScheduleId: null, // 초기 상태
  setSelectedScheduleId: (id) => set({ selectedScheduleId: id }),
}))
