'use client';

import React, { useEffect, useState } from 'react';
import KakaoMap from '@/components/Map/KakaoMap';
import styles from '@/app/place/styles/Detail.module.css';
import { Place } from '@/types/place';

interface PlaceDetailProps {
  id: string;
}

const PlaceDetail = ({ id }: PlaceDetailProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        const response = await fetch(`/api/place/${id}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch place data');
        }
        const data = await response.json();
        setSelectedPlace(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !selectedPlace) {
    return <div>Failed to load place details.</div>;
  }

  return (
    <div className={styles['detail-container']}>
      <div className={styles['map-container']}>
        <KakaoMap selectedPlace={selectedPlace} />
      </div>
      <div className={styles['content']}>
        <div className={styles['images']}>
          {selectedPlace.images.map((img, idx) => (
            <img key={idx} src={img} alt={`${selectedPlace.name} ${idx}`} />
          ))}
        </div>
        <div className={styles['info']}>
          <h1>{selectedPlace.name}</h1>
          <p>{selectedPlace.description}</p>
          <div className={styles['tags']}>
            {selectedPlace.tags.map((tag, idx) => (
              <span key={idx} className={styles['tag']}>
                {tag}
              </span>
            ))}
          </div>
          <div className={styles['additional-info']}>
            {selectedPlace.additionalInfo}
          </div>
        </div>
        <div className={styles['details']}>
          <div>
            <img src="/clock-icon.svg" alt="영업시간" />
            <span>영업시간: {selectedPlace.operatingHours}</span>
          </div>
          <div>
            <img src="/people-icon.svg" alt="최대 인원" />
            <span>최대 인원: {selectedPlace.maxGuests}명</span>
          </div>
        </div>
        <div className={styles['likes']}>
          <div className={styles['like-icon']}></div>
          <span>{selectedPlace.likes}명</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
