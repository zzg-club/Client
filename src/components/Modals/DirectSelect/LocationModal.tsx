'use client'

import EditTitle from '@/components/Header/DirectPlace/EditTitle'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface LocationModalProps {
  isVisible: boolean
  onClose: () => void
  onClickRight: () => void
  initialTitle: string
  onTitleChange: (newTitle: string) => void
  children?: React.ReactNode
}

export default function LocationModal({
  isVisible,
  onClose,
  onClickRight,
  initialTitle,
  onTitleChange,
}: LocationModalProps) {
  const router = useRouter()

  const handleSearchNavigation = () => {
    router.push('/search?from=/letsmeet')
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="w-[280px] bg-white rounded-[24px] overflow-hidden">
        <div className="flex flex-col mx-6 my-6 gap-11">
          {/* 상단 타이틀 영역 */}
          <div className="flex items-center justify-between ml-1">
            <EditTitle
              initialTitle={initialTitle}
              onTitleChange={onTitleChange}
            />
            <button
              onClick={onClose}
              className="bg-none border-none cursor-pointer"
            >
              <X className="w-6 h-6 text-[#1e1e1e]" />
            </button>
          </div>

          {/* 중간 버튼 영역 */}
          <div className="flex justify-center items-center">
            <button
              onClick={handleSearchNavigation}
              className="flex w-[228px] px-3 py-1.5 justify-end items-center gap-[10px] rounded-[24px] border border-[var(--NavBarColor,#AFAFAF)] bg-[var(--Grays-White,#FFF)] cursor-pointer"
            >
              <img
                src="/vector.svg"
                alt="위치 아이콘"
                style={{ width: '20px', height: '20px' }}
              />
            </button>
          </div>
        </div>
        {/* 하단 버튼 영역 */}
        <div className="flex justify-center items-center border-t border-[#afafaf] p-4">
          <button
            onClick={onClickRight}
            className="text-center text-[18px] font-medium leading-[22px] tracking-tight text-[var(--MainColor,#9562FB)] font-['Pretendard']"
          >
            입력 완료
          </button>
        </div>
      </div>
    </div>
  )
}
