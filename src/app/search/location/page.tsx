'use client'

import React, { useState } from 'react'
import styles from '@/app/search/styles/LocationPage.module.css'

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

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.searchBar}>
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          className={styles.arrowIcon}
        />
        <input type="text" className={styles.searchInput} />
        <button className={styles.searchButton}>검색</button>
      </div>

      {/* 위치 리스트 */}
      <div className={styles.locationList}>
        {locations.map((location, index) => (
          <div key={index} className={styles.locationItem}>
            <div className={styles.locationContent}>
              <p className={styles.locationName}>{location.name}</p>
              <p className={styles.locationAddress}>{location.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationPage
