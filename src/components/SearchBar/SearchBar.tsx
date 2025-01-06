'use client'

import React, { useRef } from 'react'
import { useRouter } from 'next/navigation' // Next.js 라우터 훅
import styles from '@/components/SearchBar/SearchBar.module.css'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  onBack?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '주소 검색',
  onSearch,
  onBack,
}) => {
  const router = useRouter() // Next.js 라우터 훅 사용
  const inputRef = useRef<HTMLInputElement>(null) // inputRef 정의

  const handleSearchClick = () => {
    if (onSearch && inputRef.current) {
      const inputValue = inputRef.current.value
      onSearch(inputValue)
    }
  }

  return (
    <div className={styles.searchInputContainer}>
      {/* 돋보기 아이콘 */}
      <img
        src="/search.svg"
        alt="돋보기 아이콘"
        className={styles.searchIcon}
      />
      {/* 검색 입력창 */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={styles.searchInput}
      />
    </div>
  )
}

export default SearchBar
