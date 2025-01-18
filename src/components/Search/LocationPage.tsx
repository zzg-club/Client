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

  const handleBack = () => {
    router.push(`/search?from=${from}`)
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
          onClick={handleBack} // 함수 호출로 변경
        />

        <SearchBar placeholder="출발지를 입력해주세요!" />
        {/* 검색 버튼 */}
        <button
          className={styles.searchButton}
          onClick={() => console.log('검색 버튼 클릭')}
        >
          검색
        </button>
      </div>
      {/* 위치 리스트 */}
      <div className={styles.locationList}>
        {locations.map((location, index) => (
          <div
            key={index}
            className={styles.locationItem}
            onClick={onLocationClick}
          >
            <p className={styles.locationName}>{location.name}</p>
            <p className={styles.locationAddress}>{location.address}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationPage
