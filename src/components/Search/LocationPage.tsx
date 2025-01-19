'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './LocationPage.module.css'
import SearchBar from '@/components/SearchBar/SearchBar'

interface LocationPageProps {
  onLocationClick: () => void // 리스트 항목 클릭 이벤트
}

const LocationPage: React.FC<LocationPageProps> = ({ onLocationClick }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [locations, setLocations] = useState([
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
    {
      name: '성북역 롯데골드타운아파트',
      address: '경기 용인시 수지구 성북로 10',
    },
  ])

  const handleBackClick = () => {
    router.push(`/search?from=${from}`)
  }

  const handleSearchClick = () => {
    // 검색 버튼 클릭 시 실행
    const inputValue = (
      document.getElementById('searchInput') as HTMLInputElement
    )?.value
    if (inputValue) {
      console.log(`검색어: ${inputValue}`)
      // 검색 로직 추가 가능
    }
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-white overflow-y-auto">
      {/* 검색창 */}
      <div className="flex w-full px-3 py-[11px] justify-center items-center gap-2 rounded-b-[24px] bg-white shadow-[0_0_10px_0_rgba(30,30,30,0.1)]">
        {/* 뒤로가기 버튼 */}
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          className="w-6 h-6 cursor-pointer"
          onClick={handleBackClick}
        />

        <SearchBar placeholder="출발지를 입력해주세요!" />
        {/* 검색 버튼 */}
        <button
          className="text-xl text-center font-pretendard font-medium leading-[17px] tracking-[-0.5px] text-[#9562fb] cursor-pointer"
          onClick={handleSearchClick}
        >
          검색
        </button>
      </div>

      {/* 위치 리스트 */}
      <div className="mt-3 w-full flex flex-col mb-[21px]">
        {locations.map((location, index) => (
          <div
            key={index}
            className="flex h-[80px] py-4 px-7 flex-col justify-center items-start gap-2 self-stretch rounded-full bg-white"
            onClick={onLocationClick}
          >
            <p className="text-[#1e1e1e] text-center font-pretendard text-[16px] font-normal leading-[17px] tracking-[-0.5px]">
              {location.name}
            </p>
            <p className="text-[#afafaf] font-pretendard text-[12px] font-normal leading-[17px] tracking-[-0.5px]">
              {location.address}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationPage
