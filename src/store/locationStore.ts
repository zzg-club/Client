import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Location 타입 정의
interface Location {
  place: string;
  lat: number;
  lng: number;
}

// Zustand 스토어 정의
interface LocationState {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  clearSelectedLocation: () => void;
}

export const useLocationStore = create(
  persist<LocationState>(
    (set) => ({
      selectedLocation: null, // 초기 상태
      setSelectedLocation: (location) => set({ selectedLocation: location }), // 선택한 위치 저장
      clearSelectedLocation: () => {
        set({ selectedLocation: null }); // 선택한 위치 초기화
        localStorage.removeItem('location-storage'); // 로컬 스토리지에서도 삭제
      },
    }),
    {
      name: 'location-storage', // localStorage에 저장될 키 이름
    }
  )
);
