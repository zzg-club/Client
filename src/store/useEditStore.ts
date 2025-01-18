import { create } from 'zustand'

interface EditStore {
  isEdit: boolean
  isEditBottomSheetOpen: boolean
  setIsEdit: (value: boolean) => void
  setIsEditBottomSheetOpen: (value: boolean) => void
}

const useEditStore = create<EditStore>((set) => ({
  isEdit: false,
  isEditBottomSheetOpen: false,
  setIsEdit: (value) =>
    set({
      isEdit: value,
    }),
  setIsEditBottomSheetOpen: (value) => set({ isEditBottomSheetOpen: value }),
}))

export default useEditStore
