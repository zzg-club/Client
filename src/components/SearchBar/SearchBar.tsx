'use client'

import React, { useState, useRef } from 'react'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  onCancel?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '원하는 곳을 검색해봐요!',
  onSearch,
  onCancel,
}) => {
  const [showCancel, setShowCancel] = useState(false) // 취소 버튼 표시 여부
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = () => {
    if (inputRef.current) {
      setShowCancel(inputRef.current.value.length > 0) // 입력값이 있을 때만 버튼 표시
    }
  }

  const handleSearch = () => {
    if (onSearch && inputRef.current) {
      onSearch(inputRef.current.value)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    if (inputRef.current) {
      inputRef.current.value = '' // 입력값 초기화
      setShowCancel(false) // 버튼 숨기기
    }
  }

  return (
    <div className={styles.searchInputContainer}>
      {/* 돋보기 아이콘 */}
      <img
        src="/search.svg"
        alt="돋보기 아이콘"
        className={styles.searchIcon}
        onClick={handleSearch}
      />
      {/* 검색 입력창 */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={styles.searchInput}
        onChange={handleInputChange} // 입력값 변화 감지
      />
      {/* 취소 버튼 */}
      {showCancel && (
        <img
          src="/cancel.svg"
          alt="취소 버튼"
          className={styles.cancelIcon}
          onClick={handleCancel}
        />
      )}
    </div>
  )
}

export default SearchBar
