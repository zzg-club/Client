import { create } from 'zustand'

interface SurveyState {
  selectedSurveyId: number | null
  setSelectedSurveyId: (id: number) => void
}

export const useSurveyStore = create<SurveyState>((set) => ({
  selectedSurveyId: null, // 초기 상태
  setSelectedSurveyId: (id) => set({ selectedSurveyId: id }),
}))
