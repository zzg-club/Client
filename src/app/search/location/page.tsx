'use client'

import React, { useState } from 'react'
import styles from './LocationPage.module.css'
import SearchBar from '@/components/SearchBar/SearchBar'

const LocationPage: React.FC = () => {
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
  ])
  const handleSearchClick = () => {
    if (onSearch) {
      const inputValue = (
        document.getElementById('searchInput') as HTMLInputElement
      )?.value
      onSearch(inputValue)
    }
  }
  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.searchBar}>
        {/* 뒤로가기 버튼 */}
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          className={styles.arrowIcon}
          onClick={() => {
            if (onBack) {
              onBack()
            } else {
              router.push('/place') // 기본적으로 'place'로 이동
            }
          }}
        />

        <SearchBar />
        {/* 검색 버튼 */}
        <button className={styles.searchButton} onClick={handleSearchClick}>
          검색
        </button>
      </div>
      {/* 위치 리스트 */}
      <div className={styles.locationList}>
        {locations.map((location, index) => (
          <div key={index} className={styles.locationItem}>
            <p className={styles.locationName}>{location.name}</p>
            <p className={styles.locationAddress}>{location.address}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationPage
