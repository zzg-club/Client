import { create } from 'zustand'

interface GroupState {
  selectedGroupId: number | null
  setSelectedGroupId: (id: number) => void
}

export const useGroupStore = create<GroupState>((set) => ({
  selectedGroupId: null, // 초기 상태
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
}))
