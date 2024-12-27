'use client'

import { MdArrowBackIos } from 'react-icons/md'
import { IoShareSocialOutline } from 'react-icons/io5'
import { GoPencil } from 'react-icons/go'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [title, setTitle] = useState(initialTitle) // 컴포넌트 내에서 제목 상태 관리

  // 뒤로 가기 버튼 클릭 핸들러
  const handleBackClick = () => {
    router.back() // 브라우저의 뒤로 가기 기능
  }

  // 제목 수정 버튼 클릭 핸들러
  const handleEditClick = () => {
    // 제목을 수정할 수 있는 입력창을 띄우거나 다른 방법으로 수정 가능
    const newTitle = prompt('제목을 수정하세요:', title)
    if (newTitle) {
      setTitle(newTitle) // 수정된 제목을 컴포넌트 내 상태에 반영
      onTitleChange(newTitle) // 상위 컴포넌트로 수정된 제목 전달
    }
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
      <div className="text-center text-[#afafaf] text-2xl font-semibold font-['Pretendard'] leading-[17px] tracking-tight ">
        {title}
      </div>
      <button onClick={handleEditClick}>
        <GoPencil className="w-6 h-6 text-[#afafaf] mb-0.5 " strokeWidth={1} />
      </button>
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
