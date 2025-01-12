'use client'

import { IoShareSocialOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import EditTitle from '@/components/Header/Middle/EditTitle'
import { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import ScheduleSelectShareModal from '@/components/Modals/ScheduleSelectShareModal'

interface TitleProps {
  buttonText: string
  buttonLink: string
  initialTitle: string // 초기 제목
  isPurple: boolean
  onTitleChange?: (newTitle: string) => void // 제목 수정 후 부모로 전달 (선택적 prop)
}

export default function Title({
  buttonText,
  buttonLink,
  initialTitle,
  onTitleChange = () => {}, // 기본값: 빈 함수
  isPurple,
}: TitleProps) {
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)

  // 버튼 클릭 시 라우팅 처리
  const handleButtonClick = () => {
    router.push(buttonLink)
  }

  // 공유 모달 열기/닫기
  const toggleShareDialog = () => {
    setIsShareOpen((prev) => !prev)
  }

  return (
    <div
      className="w-full h-16 px-4 py-5 bg-white flex items-center gap-1"
      style={{
        borderRadius: '0px 0px 24px 24px',
      }}
    >
      {/* 제목 편집 컴포넌트 */}
      <div className="w-[60%] max-w-[300px] overflow-hidden">
        <EditTitle initialTitle={initialTitle} onTitleChange={onTitleChange} />
      </div>

      {/* 공유 및 버튼 컨테이너 */}
      <div className="flex ml-auto gap-4">
        {/* 공유 버튼 */}
        <button onClick={toggleShareDialog}>
          <IoShareSocialOutline className="w-8 h-8 text-[#1e1e1e]" />
        </button>

        {/* 라우팅 버튼 */}
        <button
          className={`text-center text-xl font-medium font-['Pretendard'] leading-[25px] 
          ${isPurple ? 'text-purple-500' : 'text-[#9562fb]'}`}
          onClick={handleButtonClick}
        >
          {buttonText}
        </button>
      </div>

      {/* 공유 모달 */}
      <CustomModal
        open={isShareOpen}
        onOpenChange={toggleShareDialog}
        isFooter={false}
      >
        <ScheduleSelectShareModal inviteUrl="https://moim.team/" />
      </CustomModal>
    </div>
  )
}
