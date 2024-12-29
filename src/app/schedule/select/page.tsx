'use client'

import { useState } from 'react'
import Title from '@/components/Header/Title'
import SelectedDays from '@/components/Header/SelectedDays'
import TimeStamp from '@/components/Body/TimeStamp'

export default function Page() {
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const isPurple = false

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
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
      <SelectedDays />
      <TimeStamp />
    </div>
  )
}
