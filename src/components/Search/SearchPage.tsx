'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar/SearchBar'
import Image from 'next/image'
import { useGroupStore } from '@/store/groupStore'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/schedule'
  const isDirectModal = searchParams.get('direct') === 'true'
  const { selectedGroupId } = useGroupStore()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!selectedGroupId) {
      console.warn('그룹 ID가 설정되지 않았습니다.')
    } else {
      console.log('현재 그룹 ID:', selectedGroupId)
    }
  }, [selectedGroupId])

  const handleSearchClick = () => {
    if (!searchQuery.trim()) {
      alert('검색어를 입력해주세요.')
      return
    }

    // 검색어를 URL에 담아 `LocationPage`로 전달
    router.push(
      `/search/location?from=${from}&query=${encodeURIComponent(searchQuery)}&direct=${isDirectModal}`,
    )
  }

  const handleLocationClick = () => {
    router.push(
      `/search/location?from=${from}&query=current&direct=${isDirectModal}&direct=${isDirectModal}`,
    )
  }

  const handleBackClick = () => {
    router.push(from) //from 값으로 돌아가기기
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex w-full px-3 py-[11px] justify-center items-center gap-2 rounded-b-[24px] bg-white shadow-[0_0_10px_0_rgba(30,30,30,0.1)]">
        {/* 뒤로가기 버튼 */}
        <Image
          src="/arrow_back.svg"
          alt="뒤로 가기"
          width={24}
          height={24}
          className="w-6 h-6 cursor-pointer"
          onClick={handleBackClick}
        />

        {/* 검색바 (입력값 상태 관리) */}
        <SearchBar
          placeholder="출발지를 입력해주세요!"
          onChange={setSearchQuery}
        />

        {/* 검색 버튼 */}
        <button
          className="text-xl text-center font-pretendard font-medium leading-[17px] tracking-[-0.5px] text-[#9562fb] cursor-pointer"
          onClick={handleSearchClick}
        >
          검색
        </button>
      </div>

      {/* 내 위치 불러오기 버튼 */}
      <button
        className="flex items-center justify-center mx-auto w-[356px] h-[42px] border border-[#9562fb] rounded-[24px] text-[#9562fb] text-[14px] font-medium leading-[17px] tracking-[-0.5px] cursor-pointer gap-2 p-0 mt-4"
        onClick={handleLocationClick}
      >
        <Image
          src="/vector.svg"
          alt="위치 아이콘"
          width={28}
          height={28}
          className="w-7 h-7"
        />
        내 위치 불러오기
      </button>
    </div>
  )
}
