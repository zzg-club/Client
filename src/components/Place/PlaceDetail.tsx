'use client';

import React, { useEffect, useState, useRef } from 'react';
import KakaoMap from '@/components/Map/KakaoMap';
import styles from '@/app/place/styles/Detail.module.css';
import { Place } from '@/types/place';
import Menu from '@/components/Place/Menu'; // 메뉴 컴포넌트 임포트
import StoreInfo from '@/components/Place/StoreInfo'; // 영업 정보 컴포넌트 임포트
import VisitorPhoto from '@/components/Place/VisitorPhoto'; // 방문자 사진 컴포넌트 임포트
import SectionTitle from '@/components/Place/SectionTitle'; // 방문자 사진 컴포넌트 임포트

interface PlaceDetailProps {
  id: string;
}

const PlaceDetail = ({ id }: PlaceDetailProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'middle' | 'expanded'>('collapsed');
  const [activeTab, setActiveTab] = useState<'상세' | '메뉴' | '사진'>('상세');
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const threshold = 50;
  const mapRef = useRef<() => void | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (startY.current !== null && currentY.current !== null) {
      const delta = startY.current - currentY.current;

      if (delta > threshold) {
        setBottomSheetState((prevState) => (prevState === 'collapsed' ? 'middle' : 'expanded'));
      } else if (delta < -threshold) {
        setBottomSheetState((prevState) => (prevState === 'expanded' ? 'middle' : 'collapsed'));
      }
    }
    startY.current = null;
    currentY.current = null;
  };

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
      {/* Bottom Sheet */}
      <div
        className={`${styles.bottomSheet} ${styles[bottomSheetState]}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.dragHandle}></div>
       {/* Image Gallery */}
        <div className={styles['image-gallery']}>
          {/* Left: Large Image */}
          <div className={styles['gallery-large']}>
            <img
              src={selectedPlace.images[0]}
              alt="Large Gallery"
              className={styles['gallery-image']}
            />
          </div>

          {/* Right: Four Smaller Images */}
          <div className={styles['gallery-small-container']}>
            {selectedPlace.images.slice(1, 5).map((image, index) => (
              <div key={index} className={styles['gallery-small']}>
                <img src={image} alt={`Small Gallery ${index}`} className={styles['gallery-image']} />
                {index === 3 && selectedPlace.images.length > 5 && (
                  <div className={styles['more-overlay']}>
                    +{selectedPlace.images.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{selectedPlace.name}</h3>
              <div className={styles.likes}>
                <div className={styles.likeBackground}>
                  <div className={styles.likeIcon}></div>
                </div>
                <span>{selectedPlace.likes}명</span>
              </div>
            </div>

            {/* Tags */}
            <div className={styles.tags}>
              {selectedPlace.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className={styles.description}>풍경한우? 가족 생일마다 가는 단골 맛집! 길이 험하고 반찬 줄어든 건 아쉽지만, 고기가 정말 최고야!</div>

            {/* Tabs */}
            <div className={styles.tabContainer}>
              {['상세', '메뉴', '사진'].map((tab) => (
                <div
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.selected : ''}`}
                  onClick={() => setActiveTab(tab as '상세' | '메뉴' | '사진')}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === '상세' && (
            <>
              <div className={styles.cardContainer} style={{ marginBottom: '10px' }}>
                <StoreInfo selectedPlace={selectedPlace} />
                <div style={{ marginTop: '40px' }}>
                  <SectionTitle title="인기 메뉴" />
                </div>
                <Menu selectedPlace={selectedPlace} />
              </div>

              <div className={styles.cardContainer} style={{ marginTop: '10px' }}>
                <SectionTitle title="방문자 사진" />
                <VisitorPhoto selectedPlace={selectedPlace} />
              </div>
            </>
          )}
          {activeTab === '메뉴' && <Menu selectedPlace={selectedPlace} />}
          {activeTab === '사진' && <VisitorPhoto selectedPlace={selectedPlace} />}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;