'use client'

import React, { useState, useRef } from 'react'
import styles from './SearchBar.module.css'
import Image from 'next/image'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  onCancel?: () => void
  onChange?: (value: string) => void // ✅ 입력값 변경 시 호출할 함수 추가
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '원하는 곳을 검색해봐요!',
  onSearch,
  onCancel,
  onChange, // ✅ 입력값 변경 시 부모 컴포넌트로 전달
}) => {
  const [showCancel, setShowCancel] = useState(false) // 취소 버튼 표시 여부
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = () => {
    if (inputRef.current) {
      const value = inputRef.current.value
      setShowCancel(value.length > 0) // 입력값이 있을 때만 버튼 표시

      if (onChange) {
        onChange(value) // ✅ 부모 컴포넌트로 입력값 전달
      }
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
      if (onChange) {
        onChange('') // ✅ 빈 값 전달하여 부모 상태도 초기화
      }
    }
  }

  return (
    <div className={styles.searchInputContainer}>
      {/* 돋보기 아이콘 */}
      <Image
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
        onChange={handleInputChange} // ✅ 입력값 변화 감지하여 부모 컴포넌트로 전달
      />
      {/* 취소 버튼 */}
      {showCancel && (
        <Image
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
