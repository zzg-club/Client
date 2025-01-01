'use client'

import React, { useState, useEffect } from 'react'
import KakaoMap from '@/components/Map/KakaoMap'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import Title from '@/components/Header/Title'
import styles from '@/app/place/styles/Home.module.css'

interface Location {
  lat: number
  lng: number
  name: string
}

export default function Middle() {
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null)

  useEffect(() => {
    getCurrentLocation()
      .then((location) => {
        setSelectedPlace({
          lat: location.lat,
          lng: location.lng,
          name: '현재 위치',
        })
      })
      .catch((error) => console.error('Error getting location:', error))
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title />
      </div>
      <KakaoMap selectedPlace={selectedPlace} />
    </div>
  )
}
