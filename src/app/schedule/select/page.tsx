'use client'

import { useState } from 'react'
import Title from '@/components/Header/Title' // 하위 컴포넌트

export default function Page() {
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const isPurple = false

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  return (
    <div>
      <Title
        buttonText="완료"
        buttonLink="/"
        initialTitle={title} // 하위 컴포넌트에 제목 전달
        onTitleChange={handleTitleChange} // 제목 수정 함수 전달
        isPurple={isPurple}
      />
    </div>
  )
}
