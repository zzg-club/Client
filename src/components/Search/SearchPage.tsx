'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar/SearchBar'

export default function SearchPage() {
  const router = useRouter() // Next.js 라우터 훅
  const searchParams = useSearchParams() // 쿼리 파라미터 사용
  const from = searchParams.get('from') || '/schedule' // 기본값: /letsmeet

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

  const handleLocationClick = () => {
    router.push(`/search/location?from=${from}`) // from 값을 포함한 URL로 이동
  }

  const handleBackClick = () => {
    router.push(from) //from 값으로 돌아가기기
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: '11px 12px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '0px 0px 24px 24px',
          background: 'var(--Grays-White, #fff)',
          boxShadow: '0px 0px 10px 0px rgba(30, 30, 30, 0.1)',
        }}
      >
        {/* 뒤로가기 버튼 */}
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          onClick={handleBackClick}
        />

        <SearchBar />

        {/* 검색 버튼 */}
        <button
          style={{
            color: 'var(--MainColor, #9562fb)',
            textAlign: 'center',
            fontFamily: 'Pretendard',
            whiteSpace: 'nowrap',
            fontStyle: 'normal',
            fontWeight: 550,
            lineHeight: '17px',
            letterSpacing: '-0.5px',
            cursor: 'pointer',
          }}
          onClick={handleSearchClick}
        >
          검색
        </button>
      </div>

      {/* 내 위치 불러오기 버튼 */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // 내부 콘텐츠를 중앙 정렬
          margin: '0 auto', // 부모 컨테이너 내에서 중앙 정렬
          width: '356px', // 버튼의 고정 너비
          height: '42px',
          border: '1px solid #9562fb', // 테두리 색상
          borderRadius: '24px',
          color: '#9562fb', // 텍스트 색상
          fontSize: '14px',
          fontWeight: 550,
          lineHeight: '17px',
          letterSpacing: '-0.5px',
          cursor: 'pointer',
          gap: '8px',
          padding: '0', // 패딩 제거
          marginTop: '16px', // 버튼 위쪽 간격
        }}
        onClick={handleLocationClick}
      >
        <img
          src="/vector.svg"
          alt="위치 아이콘"
          style={{
            width: '28px',
            height: '28px',
          }}
        />
        내 위치 불러오기
      </button>
    </div>
  )
}
