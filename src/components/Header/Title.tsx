'use client'

import { MdArrowBackIos } from 'react-icons/md'
import { IoShareSocialOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import EditTitle from '@/components/Header/EditTitle'

interface TitleProps {
  buttonText: string
  buttonLink: string
  initialTitle: string // 초기 제목
  isPurple: boolean
  onTitleChange: (newTitle: string) => void // 제목 수정 후 부모로 전달
}

export default function Title({
  buttonText,
  buttonLink,
  initialTitle,
  onTitleChange,
  isPurple,
}: TitleProps) {
  const router = useRouter()

  // 뒤로 가기 버튼 클릭 핸들러
  const handleBackClick = () => {
    router.back() // 브라우저의 뒤로 가기 기능
  }

  // 다음, 완료, 확정 버튼 클릭 핸들러
  const handleButtonClick = () => {
    router.push(buttonLink) // 지정된 페이지로 이동
  }

  return (
    <div className=" w-full h-16 px-6 py-5 bg-white rounded-bl-3xl rounded-br-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)] flex items-center gap-1">
      <button onClick={handleBackClick}>
        <MdArrowBackIos className=" w-7 h-7 text-[#1e1e1e]" />
      </button>
      <EditTitle initialTitle={initialTitle} onTitleChange={onTitleChange} />
      <div className="flex ml-auto gap-5">
        <button>
          <IoShareSocialOutline className="w-8 h-8 text-[#1e1e1e]" />
        </button>
        <button
          className={`text-center text-xl font-medium font-['Pretendard'] leading-[17px] 
          ${isPurple ? 'text-purple-500' : 'text-[#afafaf]'}`}
          onClick={handleButtonClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
